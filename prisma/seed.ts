import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: "users.manage", description: "Gerenciar usuários" },
  { key: "links.manage", description: "Gerenciar links" },
  { key: "modules.manage", description: "Gerenciar módulos" },
  { key: "module.videos.view", description: "Ver módulo Vídeos" },
  { key: "module.audios.view", description: "Ver módulo Áudios" },
  { key: "module.musicas.view", description: "Ver módulo Músicas" },
  { key: "module.packs.view", description: "Ver módulo Packs e Plugins" },
  { key: "module.links.view", description: "Ver módulo Links" },
  { key: "module.admin.view", description: "Ver módulo Admin" },
];

const MODULES = [
  {
    key: "videos",
    label: "Vídeos",
    icon: "videos",
    route: "/",
    order: 1,
    permissionKey: "module.videos.view",
    links: [
      {
        title: "Pexels",
        url: "https://www.pexels.com/",
        description: "Vídeos e fotos gratuitas em alta qualidade",
      },
      {
        title: "Mixkit",
        url: "https://mixkit.co/",
        description: "Vídeos, clipes e templates gratuitos",
      },
      {
        title: "Motion Array",
        url: "https://motionarray.com/",
        description: "Templates e projetos prontos para After Effects",
      },
      {
        title: "Videohive (Envato)",
        url: "https://videohive.net/",
        description: "Marketplace com milhares de templates de motion graphics",
      },
      {
        title: "Rocketstock",
        url: "https://www.rocketstock.com/",
        description: "Templates e presets gratuitos e pagos para After Effects",
      },
      {
        title: "Video Copilot",
        url: "https://www.videocopilot.net/",
        description: "Tutoriais avançados de efeitos visuais e composição",
      },
    ],
  },
  {
    key: "audios",
    label: "Áudios",
    icon: "audios",
    route: "/",
    order: 2,
    permissionKey: "module.audios.view",
    links: [
      {
        title: "Freesound",
        url: "https://freesound.org/",
        description: "Efeitos sonoros gratuitos para edição",
      },
      {
        title: "Zapsplat",
        url: "https://www.zapsplat.com/",
        description: "Biblioteca extensa de efeitos sonoros e músicas",
      },
    ],
  },
  {
    key: "musicas",
    label: "Músicas",
    icon: "musicas",
    route: "/",
    order: 3,
    permissionKey: "module.musicas.view",
    links: [
      {
        title: "Uppbeat",
        url: "https://uppbeat.io/",
        description: "Músicas gratuitas com licença para criadores",
      },
      {
        title: "YouTube Audio Library",
        url: "https://www.youtube.com/audiolibrary",
        description: "Biblioteca oficial de músicas e efeitos sonoros do YouTube",
      },
      {
        title: "Pixabay Music",
        url: "https://pixabay.com/music/",
        description: "Músicas livres de direitos para qualquer projeto",
      },
    ],
  },
  {
    key: "packs",
    label: "Packs e Plugins",
    icon: "packs",
    route: "/",
    order: 4,
    permissionKey: "module.packs.view",
    links: [
      {
        title: "Aescripts + Aeplugins",
        url: "https://aescripts.com/",
        description: "Maior marketplace de plugins e scripts para After Effects",
      },
      {
        title: "Motion Bro",
        url: "https://motionbro.com/",
        description: "Extensão com pacotes de transições, sons e elementos animados",
      },
      {
        title: "Render Garden",
        url: "https://www.renderoutgarden.com/",
        description: "Plugin para acelerar renderizações no After Effects",
      },
      {
        title: "Video Copilot Store",
        url: "https://www.videocopilot.net/plugins/",
        description: "Plugins como Element 3D, Optical Flares e Saber",
      },
    ],
  },
  {
    key: "links",
    label: "Links",
    icon: "links",
    route: "/",
    order: 5,
    permissionKey: "module.links.view",
    links: [
      {
        title: "School of Motion",
        url: "https://www.schoolofmotion.com/",
        description: "Cursos e artigos sobre motion design e After Effects",
      },
      {
        title: "r/AfterEffects",
        url: "https://www.reddit.com/r/AfterEffects/",
        description: "Comunidade ativa para tirar dúvidas e compartilhar projetos",
      },
      {
        title: "Adobe Fonts",
        url: "https://fonts.adobe.com/",
        description: "Biblioteca de fontes integrada com o Creative Cloud",
      },
      {
        title: "Coolors",
        url: "https://coolors.co/",
        description: "Gerador de paletas de cores para projetos visuais",
      },
    ],
  },
  {
    key: "admin",
    label: "Admin",
    icon: "admin",
    route: "/admin",
    order: 6,
    permissionKey: "module.admin.view",
    links: [],
  },
];

async function main() {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {},
      create: permission,
    });
  }

  const moduleViewKeys = PERMISSIONS.filter((p) => p.key.startsWith("module."))
    .filter((p) => p.key !== "module.admin.view")
    .map((p) => p.key);

  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin" },
  });
  const editorRole = await prisma.role.upsert({
    where: { name: "Editor" },
    update: {},
    create: { name: "Editor" },
  });
  const viewerRole = await prisma.role.upsert({
    where: { name: "Viewer" },
    update: {},
    create: { name: "Viewer" },
  });

  async function setRolePermissions(roleId: string, keys: string[]) {
    const permissions = await prisma.permission.findMany({
      where: { key: { in: keys } },
    });
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId: permission.id },
        },
        update: {},
        create: { roleId, permissionId: permission.id },
      });
    }
  }

  await setRolePermissions(
    adminRole.id,
    PERMISSIONS.map((p) => p.key)
  );
  await setRolePermissions(editorRole.id, [
    ...moduleViewKeys,
    "links.manage",
  ]);
  await setRolePermissions(viewerRole.id, moduleViewKeys);

  for (const moduleData of MODULES) {
    const { links, ...moduleFields } = moduleData;
    const createdModule = await prisma.module.upsert({
      where: { key: moduleFields.key },
      update: moduleFields,
      create: moduleFields,
    });

    for (const [index, link] of links.entries()) {
      const existing = await prisma.link.findFirst({
        where: { moduleId: createdModule.id, url: link.url },
      });
      if (existing) {
        await prisma.link.update({
          where: { id: existing.id },
          data: { ...link, order: index, moduleId: createdModule.id },
        });
      } else {
        await prisma.link.create({
          data: { ...link, order: index, moduleId: createdModule.id },
        });
      }
    }
  }

  const adminEmail = process.env.ADMIN_USER ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) {
    console.warn(
      "ADMIN_USER/ADMIN_PASSWORD não definidos — usando valores de exemplo. Defina-os no .env antes de rodar em produção."
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash,
      status: "ACTIVE",
      roleId: adminRole.id,
    },
  });

  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
