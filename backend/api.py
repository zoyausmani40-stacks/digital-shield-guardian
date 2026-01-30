"""
FootprintGuard API - Uses LangGraph workflow
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
import sys
import os
from datetime import datetime

# Add the backend directory to path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the LangGraph workflow
from app.graph import app as graph_app

# Initialize FastAPI app
app = FastAPI(
    title="FootprintGuard API",
    description="Autonomous Digital Footprint Risk Analysis API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class ScanRequest(BaseModel):
    """Request model for initiating a scan"""
    githubUsername: Optional[str] = Field(None, description="GitHub username to analyze")
    email: Optional[EmailStr] = Field(None, description="Email address to check for breaches")
    socialHandles: Optional[str] = Field(None, description="Social media handles (comma-separated)")
    fullName: Optional[str] = Field(None, description="Full name for additional context")


class ScanResponse(BaseModel):
    """Response model for scan results"""
    riskScore: int
    riskLevel: str
    riskFactors: List[str]
    mitigations: List[str]
    evidence: Dict[str, Any]
    timestamp: str


def normalize_input(request: ScanRequest) -> Dict[str, Any]:
    """Normalize the scan request"""
    normalized = {}
    
    if request.githubUsername:
        username = request.githubUsername.strip().lstrip('@')
        normalized["username"] = username
    
    if request.email:
        normalized["email"] = request.email
    
    if request.fullName:
        normalized["name"] = request.fullName
    
    if request.socialHandles:
        handles = [h.strip() for h in request.socialHandles.split(',')]
        if handles and not request.githubUsername:
            normalized["username"] = handles[0].lstrip('@')
    
    return normalized


def run_planner(user_input: Dict[str, Any]) -> Dict[str, Any]:
    """Planner: Decide which tasks to run"""
    tasks = []
    
    if "email" in user_input:
        tasks.append("check_breach_exposure")
    
    if "username" in user_input:
        tasks.append("analyze_github_public_data")
        tasks.append("check_username_reuse")
    
    return {
        "tasks": tasks,
        "normalized_input": user_input,
        "notes": []
    }


def run_gatherer(planner_output: Dict[str, Any]) -> Dict[str, Any]:
    """Gatherer: Collect evidence from tools"""
    from app.tools.email_breach import check_email_breach_leakcheck
    from app.tools.github import fetch_github_public_data
    from app.tools.username_reuse import check_username_reuse
    
    tasks = planner_output.get("tasks", [])
    inputs = planner_output.get("normalized_input", {})
    evidence = {}
    
    # Email breach check
    if "check_breach_exposure" in tasks and "email" in inputs:
        try:
            breach_data = check_email_breach_leakcheck(inputs["email"])
            evidence["email"] = {
                "value": inputs["email"],
                "found_in_breaches": breach_data.get("found_in_breaches"),
                "breach_sources": breach_data.get("breach_sources", [])
            }
        except Exception as e:
            print(f"Email breach check failed: {e}")
            evidence["email"] = {
                "value": inputs["email"],
                "found_in_breaches": None,
                "breach_sources": [],
                "error": str(e)
            }
    
    # GitHub data
    if "analyze_github_public_data" in tasks and "username" in inputs:
        try:
            username = inputs["username"].rstrip("/").split("/")[-1]
            github_data = fetch_github_public_data(username)
            evidence["github"] = {
                "username": username,
                "public_repos": github_data.get("public_repos"),
                "commit_email_exposed": github_data.get("commit_email_exposed")
            }
        except Exception as e:
            print(f"GitHub check failed: {e}")
            evidence["github"] = {
                "username": inputs.get("username"),
                "public_repos": None,
                "commit_email_exposed": None,
                "error": str(e)
            }
    
    # Username reuse
    if "check_username_reuse" in tasks and "username" in inputs:
        try:
            username_data = check_username_reuse(inputs["username"])
            evidence["username"] = {
                "value": username_data["value"],
                "reuse_count": username_data["reuse_count"],
                "platforms": username_data["platforms"]
            }
        except Exception as e:
            print(f"Username reuse check failed: {e}")
            evidence["username"] = {
                "value": inputs.get("username"),
                "reuse_count": 0,
                "platforms": [],
                "error": str(e)
            }
    
    return evidence


def run_generator(evidence: Dict[str, Any]) -> Dict[str, Any]:
    """Generator: Create risk assessment"""
    risk_factors = []
    mitigations = []
    risk_score = 0
    
    # Analyze email evidence
    if "email" in evidence:
        email_data = evidence["email"]
        if email_data.get("found_in_breaches"):
            breach_count = len(email_data.get("breach_sources", []))
            risk_factors.append(f"Email found in {breach_count} data breach(es)")
            risk_score += min(30, breach_count * 10)
            mitigations.append("Change passwords on affected accounts immediately")
            mitigations.append("Enable two-factor authentication on all accounts")
    
    # Analyze GitHub evidence
    if "github" in evidence:
        github_data = evidence["github"]
        if github_data.get("commit_email_exposed"):
            risk_factors.append("Email address exposed in public GitHub commits")
            risk_score += 20
            mitigations.append("Use GitHub's noreply email for future commits")
        
        repos = github_data.get("public_repos")
        if repos and repos > 0:
            risk_factors.append(f"Public GitHub profile with {repos} repositories")
            risk_score += min(15, repos)
    
    # Analyze username reuse
    if "username" in evidence:
        username_data = evidence["username"]
        reuse_count = username_data.get("reuse_count", 0)
        if reuse_count > 0:
            platforms = username_data.get("platforms", [])
            risk_factors.append(f"Username reused across {reuse_count} platforms: {', '.join(platforms)}")
            risk_score += min(25, reuse_count * 5)
            mitigations.append("Consider using different usernames for professional vs personal accounts")
    
    # Determine risk level
    if risk_score <= 30:
        risk_level = "Low"
    elif risk_score <= 60:
        risk_level = "Medium"
    else:
        risk_level = "High"
    
    # Add general mitigation
    if not mitigations:
        mitigations.append("Maintain good security hygiene across all online accounts")
    
    # Cap risk score at 100
    risk_score = min(100, risk_score)
    
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors if risk_factors else ["No significant risks detected"],
        "mitigations": mitigations
    }


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "FootprintGuard API",
        "status": "operational",
        "version": "1.0.0-simple"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "api": "operational",
            "tools": "operational"
        }
    }


@app.post("/api/scan", response_model=ScanResponse)
async def initiate_scan(request: ScanRequest):
    """
    Initiate a digital footprint risk analysis scan using LangGraph workflow
    """
    
    # Validate input
    if not any([request.githubUsername, request.email, request.socialHandles]):
        raise HTTPException(
            status_code=400,
            detail="At least one of githubUsername, email, or socialHandles must be provided"
        )
    
    try:
        # 1. Normalize input
        normalized_input = normalize_input(request)
        print(f"Normalized input: {normalized_input}")
        
        # 2. Run LangGraph workflow
        initial_state = {
            "user_input": normalized_input,
            "planner_output": {},
            "evidence": {},
            "draft_output": {},
            "evaluation": None,
            "revision_count": 0,
            "final_report": {}
        }
        
        # Execute the graph workflow
        result = graph_app.invoke(initial_state)
        print(f"Graph execution complete. Final report: {result.get('final_report', {})}")
        
        # 3. Extract results from final report
        final_report = result.get("final_report", {})
        evidence = result.get("evidence", {})
        
        # If no final report or empty, fall back to draft output
        if not final_report or not final_report.get("risk_score"):
            final_report = result.get("draft_output", {})
        
        # 4. Format response
        response = ScanResponse(
            riskScore=final_report.get("risk_score", 0),
            riskLevel=final_report.get("risk_level", "Low"),
            riskFactors=final_report.get("risk_factors", []),
            mitigations=final_report.get("mitigations", []),
            evidence=evidence,
            timestamp=datetime.utcnow().isoformat()
        )
        
        return response
        
    except Exception as e:
        print(f"Error during scan: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during the scan: {str(e)}"
        )


@app.get("/api/tools/status")
async def get_tools_status():
    """Check the status of integrated tools"""
    return {
        "tools": [
            {
                "name": "GitHub API",
                "status": "operational",
                "description": "Fetches public GitHub profile data"
            },
            {
                "name": "LeakCheck",
                "status": "operational",
                "description": "Checks email addresses against breach databases"
            },
            {
                "name": "Username Reuse Detection",
                "status": "operational",
                "description": "Checks username presence across multiple platforms"
            }
        ],
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )