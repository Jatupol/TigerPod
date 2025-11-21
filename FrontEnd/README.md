# Build   Front-end Image
podman build -t oqa-qc-frontend:1.0.0 -f Containerfile .

# Build   Front-end IContainer
podman run -d \
  --name oqa-qc-frontend \
  --network tigernetwork \
  -p 8081:80 \
  -v /mnt/Data/Tiger/qcv-system/frontend_app/dist:/usr/share/nginx/html \
  --restart unless-stopped \
  oqa-qc-frontend:1.0.0


 # DDS RUN
sudo podman run -d \
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