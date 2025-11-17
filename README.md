# --------------------------------------  Images  --------------------------------------  
# Build frontend image
podman build -t localhost/oqa-qc-frontend:1.0.0 -f Containerfile .

# Build frontend image
podman build -t localhost/oqa-qc-backend:1.0.0 -f Containerfile .
 
# --------------------------------------  Container  --------------------------------------  

# Build frontend container
podman run -d \
    --name tiger_oqa-qc-frontend \
    --network tigernetwork \
    -p 8022:80 \
    -v /mnt/Data/Tiger/qcv-system/frontend_app/dist:/usr/share/nginx/html \
    --restart unless-stopped \
    --health-cmd="curl -f http://localhost/health || exit 1" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    localhost/oqa-qc-frontend:1.0.0

# Build backend container
podman run -d \
    --name tiger_oqa-qc-backend \
    --network tigernetwork \
    -p 8021:8080 \
    -v /mnt/Data/Tiger/qcv-system/backend_app/dist:/app/dist \
    -v /mnt/Data/Tiger/qcv-system/backend_app/logs:/app/logs \
    -v /mnt/Data/Tiger/qcv-system/backend_app/uploads:/app/uploads \
    -v /mnt/Data/Tiger/qcv-system/backend_app/reports:/app/reports \
    -v /mnt/Data/Tiger/qcv-system/backend_app/temp:/app/temp \
    --env-file /mnt/Data/Tiger/qcv-system/backend_app/.env \
    --restart unless-stopped \
    --health-cmd="curl -f http://localhost:8080/health || exit 1" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    --health-start-period=40s \
    localhost/oqa-qc-backend:1.0.0