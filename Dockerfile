ARG IMAGE_VERSION="latest"
FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/ci-node-runtime-22:${IMAGE_VERSION}

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .