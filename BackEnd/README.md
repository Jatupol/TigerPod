# Server  tnhkdds-app01
# Build Back-end Image
podman build -t localhost/oqa-qc-backend:1.0.0 -f Containerfile .

# Build Back-end Contrainer

podman run -d \
    --name oqa-qc-backend \
    --network host \
    -v /mnt/Data/Tiger/qcv-system/backend_app/dist:/app/dist \
    -v /mnt/Data/Tiger/qcv-system/backend_app/logs:/app/logs \
    -v /mnt/Data/Tiger/qcv-system/backend_app/uploads:/app/uploads \
    -v /mnt/Data/Tiger/qcv-system/backend_app/reports:/app/reports \
    -v /mnt/Data/Tiger/qcv-system/backend_app/temp:/app/temp \
    -e DB_HOST=localhost \
    --env-file /mnt/Data/Tiger/qcv-system/backend_app/.env \
    --restart unless-stopped \
    localhost/oqa-qc-backend:1.0.0

 # DDS RUN
 sudo podman run -d \
    --name tiger_oqa-qc-backend \
    --network tigernetwork \
    -p 8021:8080 \
    -v /mnt/Data/Tiger/qcv-system/backend_app/dist:/app/dist \
    -v /mnt/Data/Tiger/qcv-system/backend_app/logs:/app/logs \
    -v /mnt/Data/Tiger/qcv-system/backend_app/uploads:/app/uploads \
    -v /mnt/Data/Tiger/qcv-system/backend_app/reports:/app/reports \
    -v /mnt/Data/Tiger/qcv-system/backend_app/temp:/app/temp \
    --env-file /mnt/Data/Tiger/qcv-system/backend_app/.env  \
    --restart unless-stopped \
    --health-cmd="curl -f http://localhost:8080/health || exit 1" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    --health-start-period=40s \
    localhost/oqa-qc-backend:1.0.0