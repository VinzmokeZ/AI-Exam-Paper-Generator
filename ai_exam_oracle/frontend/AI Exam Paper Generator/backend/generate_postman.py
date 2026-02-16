import json
import requests
from app.main import app
from fastapi.openapi.utils import get_openapi

def generate_postman_collection():
    print("Generating Postman Collection...")
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        openapi_version=app.openapi_version,
        description=app.description,
        routes=app.routes,
    )

    # Convert OpenAPI to Postman (Simplified conversion)
    # Since direct conversion is complex, we will create a basic collection structure
    # that points to the endpoints defined in OpenAPI
    
    collection = {
        "info": {
            "name": "AI Exam Oracle API",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": []
    }

    for path, methods in openapi_schema["paths"].items():
        for method, details in methods.items():
            item = {
                "name": f"{method.upper()} {path}",
                "request": {
                    "method": method.upper(),
                    "header": [],
                    "url": {
                        "raw": f"{{{{base_url}}}}{path}",
                        "host": ["{{base_url}}"],
                        "path": [p for p in path.split("/") if p]
                    },
                    "description": details.get("summary", "")
                },
                "response": []
            }
            
            # Add basic body for POST requests if needed
            if method.upper() == "POST":
                item["request"]["body"] = {
                    "mode": "raw",
                    "raw": "{}",
                    "options": {
                        "raw": {
                            "language": "json"
                        }
                    }
                }

            collection["item"].append(item)

    # Save to file
    with open("postman_collection.json", "w") as f:
        json.dump(collection, f, indent=4)
    
    print("Postman Collection saved to backend/postman_collection.json")

if __name__ == "__main__":
    generate_postman_collection()
