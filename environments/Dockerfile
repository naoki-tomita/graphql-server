FROM node:slim AS build-env
COPY ./ /work/
WORKDIR /work
RUN yarn && yarn build

FROM node:slim
COPY --from=build-env \
     /work/dist/ \
     /work/package.json \
     /work/yarn.lock \
     /app/
RUN yarn --prod && yarn cache clean && npm -g un npm
CMD ["node", "/app/index.js"]
