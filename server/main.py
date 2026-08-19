from fastapi import FastAPI

app = FastAPI(title="MORU API")

@app.get("/")
def root():
    return {"service": "MORU", "status": "ok"}

@app.get("/health")
def health():
    return {"ok": True}
