import { defineRailway, github, project, service } from "railway/iac";

export default defineRailway(() => {
  const web = service("minisitio", {
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
    resources: [web, db],
  });
});
