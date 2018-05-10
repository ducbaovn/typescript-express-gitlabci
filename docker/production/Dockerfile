FROM vothanhkiet/alpine-s6-node-native:7.10.0

MAINTAINER Kiet Thanh Vo <kiet@ventuso.net>

WORKDIR /app
COPY ./app /app
ADD ./root /

RUN cd /app && \
    npm install --quiet

RUN rm -rf /var/cache/apk/* /root/.npm /root/.node-gyp /tmp/* /var/tmp/*

EXPOSE 3000
