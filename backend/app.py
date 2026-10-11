from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from mysql.connector import Error as MySQLError

from db import get_connection

app = Flask(__name__)
CORS(app)

REQUIRED_FIELDS = [
    "title",
    "description",
    "research_area",
    "faculty_name",
    "department",
    "required_skills",
    "available_positions",
    "application_deadline",
]

VALID_STATUSES = {"Open", "Closed"}


def validate_opportunity(data, partial=False):
    """Returns a list of validation error messages. Empty list means valid."""
    errors = []

    fields_to_check = REQUIRED_FIELDS if not partial else [
        f for f in REQUIRED_FIELDS if f in data
    ]

    for field in fields_to_check:
        value = data.get(field)
        if value is None or (isinstance(value, str) and value.strip() == ""):
            errors.append(f"'{field}' is required and cannot be empty.")

    if "available_positions" in data and data.get("available_positions") is not None:
        try:
            positions = int(data["available_positions"])
            if positions < 1:
                errors.append("'available_positions' must be a positive integer.")
        except (ValueError, TypeError):
            errors.append("'available_positions' must be a valid integer.")

    if "application_deadline" in data and data.get("application_deadline"):
        try:
            datetime.strptime(str(data["application_deadline"]), "%Y-%m-%d")
        except ValueError:
            errors.append("'application_deadline' must be in YYYY-MM-DD format.")

    if "status" in data and data.get("status") is not None:
        if data["status"] not in VALID_STATUSES:
            errors.append("'status' must be either 'Open' or 'Closed'.")

    return errors


def row_to_dict(row):
    if row is None:
        return None
    result = dict(row)
    for field in ("application_deadline", "created_at", "updated_at"):
        value = result.get(field)
        if value is None:
            continue
        if hasattr(value, "strftime"):
            fmt = "%Y-%m-%d" if field == "application_deadline" else "%Y-%m-%d %H:%M:%S"
            result[field] = value.strftime(fmt)
        else:
            result[field] = str(value)
    return result


@app.errorhandler(404)
def not_found(_e):
    return jsonify({"error": "Resource not found."}), 404


@app.errorhandler(500)
def server_error(_e):
    return jsonify({"error": "Internal server error."}), 500


@app.route("/api/opportunities", methods=["POST"])
def create_opportunity():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    errors = validate_opportunity(data)
    if errors:
        return jsonify({"error": "Validation failed.", "details": errors}), 400

    status = data.get("status", "Open")
    if status not in VALID_STATUSES:
        status = "Open"

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO opportunities
                (title, description, research_area, faculty_name, department,
                 required_skills, available_positions, application_deadline, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data["title"],
                data["description"],
                data["research_area"],
                data["faculty_name"],
                data["department"],
                data["required_skills"],
                int(data["available_positions"]),
                data["application_deadline"],
                status,
            ),
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"message": "Research opportunity created.", "id": new_id}), 201
    except MySQLError as e:
        return jsonify({"error": "Database error.", "details": str(e)}), 500


@app.route("/api/opportunities", methods=["GET"])
def get_opportunities():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM opportunities ORDER BY created_at DESC")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify([row_to_dict(r) for r in rows]), 200
    except MySQLError as e:
        return jsonify({"error": "Database error.", "details": str(e)}), 500


@app.route("/api/opportunities/<int:opportunity_id>", methods=["GET"])
def get_opportunity(opportunity_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM opportunities WHERE id = %s", (opportunity_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if row is None:
            return jsonify({"error": f"Opportunity with id {opportunity_id} not found."}), 404
        return jsonify(row_to_dict(row)), 200
    except MySQLError as e:
        return jsonify({"error": "Database error.", "details": str(e)}), 500


@app.route("/api/opportunities/<int:opportunity_id>", methods=["PUT"])
def update_opportunity(opportunity_id):
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    errors = validate_opportunity(data, partial=True)
    if errors:
        return jsonify({"error": "Validation failed.", "details": errors}), 400

    if not data:
        return jsonify({"error": "No fields provided to update."}), 400

    allowed_fields = REQUIRED_FIELDS + ["status"]
    updates = {k: v for k, v in data.items() if k in allowed_fields}
    if not updates:
        return jsonify({"error": "No valid fields provided to update."}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM opportunities WHERE id = %s", (opportunity_id,))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return jsonify({"error": f"Opportunity with id {opportunity_id} not found."}), 404

        set_clause = ", ".join(f"{field} = %s" for field in updates)
        values = list(updates.values())
        values.append(opportunity_id)

        cursor.execute(
            f"UPDATE opportunities SET {set_clause} WHERE id = %s",
            values,
        )
        conn.commit()

        cursor.execute("SELECT * FROM opportunities WHERE id = %s", (opportunity_id,))
        updated_row = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify({"message": "Opportunity updated.", "opportunity": row_to_dict(updated_row)}), 200
    except MySQLError as e:
        return jsonify({"error": "Database error.", "details": str(e)}), 500


@app.route("/api/opportunities/<int:opportunity_id>", methods=["DELETE"])
def delete_opportunity(opportunity_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM opportunities WHERE id = %s", (opportunity_id,))
        if cursor.fetchone() is None:
            cursor.close()
            conn.close()
            return jsonify({"error": f"Opportunity with id {opportunity_id} not found."}), 404

        cursor.execute("DELETE FROM opportunities WHERE id = %s", (opportunity_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": f"Opportunity with id {opportunity_id} deleted."}), 200
    except MySQLError as e:
        return jsonify({"error": "Database error.", "details": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
