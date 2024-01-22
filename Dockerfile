ARG IMAGE_VERSION="latest"
FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/ci-node-runtime-20:${IMAGE_VERSION}

RUN cp -r ./dist/* ./ && rm -rf ./dist
RUN ls
CMD ["./server.js","--","3000"]
EXPOSE 3000
