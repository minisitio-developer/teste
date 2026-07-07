import { defineRailway, github, project, service, redis } from "railway/iac";

export default defineRailway(() => {
  const cache = redis("Redis");

  const web = service("minisitio-v2", {
    source: github("eduardotrindade/minisitio", {
      branch: "master",
    }),
    rootDirectory: "/",
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "Dockerfile",
    },
    deploy: {
      startCommand: "node back/index.js",
      restartPolicyType: "ON_FAILURE",
      restartPolicyMaxRetries: 10,
    },
    env: {
      REDIS_URL: cache.env.REDIS_URL,
    },
    volumes: ["/app/back/public"],
  });

  const db = service("MySQL", {
    source: {
      image: "mysql:9.4",
    },
    deploy: {
      startCommand:
        "docker-entrypoint.sh mysqld --innodb-use-native-aio=0 --disable-log-bin --performance_schema=0 --innodb-buffer-pool-size=1G",
      restartPolicyType: "ON_FAILURE",
      restartPolicyMaxRetries: 10,
    },
    volumes: ["/var/lib/mysql"],
  });

  return project("sunny-appreciation", {
    resources: [web, db, cache],
  });
});
