FROM 169942020521.dkr.ecr.eu-west-2.amazonaws.com/base/node-18:18-alpine-builder
FROM 169942020521.dkr.ecr.eu-west-2.amazonaws.com/base/node-18:18-alpine-runtime

RUN cp -r ./dist/* ./ && rm -rf ./dist
RUN ls
CMD ["./server.js","--","3000"]
EXPOSE 3000
