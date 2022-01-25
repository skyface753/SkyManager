# (cd skymanager_flutter; flutter build web)


# Works automatically with GitHub Actions and Docker Hub
docker build -t skyface753/skymanager-backend SkyManager-Backend/.
docker build -t skyface753/skymanager skymanager_flutter/.

docker push skyface753/skymanager-backend
docker push skyface753/skymanager
docker-compose pull
