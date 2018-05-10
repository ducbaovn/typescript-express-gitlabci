{
  "AWSEBDockerrunVersion": "1",
  "Authentication": {
    "Bucket": "elasticbeanstalk-us-east-2-688426415117",
    "Key": "dockercfg.json"
  },
  "Image": {
    "Name": "registry.ventuso.net/fi-interactive/fi-service:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "3000"
    }
  ]
}