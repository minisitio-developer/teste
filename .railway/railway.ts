import { defineRailway, github, mysql, project, redis, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Redis = redis("Redis");
  const MySQL = mysql("MySQL");
  const mysqlVolume = volume("mysql-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "sfo", sizeMB: 5000 });
  const redisVolume = volume("redis-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "sfo", sizeMB: 5000 });
  const vendasMini = service("vendas-mini", {
    source: github("eduardotrindade/vendas-mini", { branch: "migration/upgrade-stack" }),
    replicas: 1,
  });
  const minichina = service("minichina", {
    source: github("eduardotrindade/minichina", { branch: "master" }),
    replicas: 1,
  });
  const MiniChina = service("MiniChina", {
    source: github("eduardotrindade/minisitio", { branch: "master" }),
    replicas: 1,
    networking: { privateNetworkEndpoint: "minisitio-v2" },
    env: {
      ADMIN_CNPJ: "23707648000199",
      ADMIN_SENHA: "Admin123",
    },
  });

  return project("sunny-appreciation", {
    resources: [Redis, MySQL, vendasMini, minichina, MiniChina, mysqlVolume, redisVolume],
  });
});
