export type LinkItem = {
  title: string;
  url: string;
  description: string;
};

export type Category = {
  name: string;
  links: LinkItem[];
};

export const categories: Category[] = [
  {
    name: "Plugins e Scripts",
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
        title: "Rocketstock",
        url: "https://www.rocketstock.com/",
        description: "Templates e presets gratuitos e pagos para After Effects",
      },
    ],
  },
  {
    name: "Presets e Templates",
    links: [
      {
        title: "Motion Array",
        url: "https://motionarray.com/",
        description: "Templates, presets de áudio e projetos prontos para After Effects",
      },
      {
        title: "Videohive (Envato)",
        url: "https://videohive.net/",
        description: "Marketplace com milhares de templates de motion graphics",
      },
      {
        title: "Mixkit",
        url: "https://mixkit.co/",
        description: "Vídeos, músicas e templates gratuitos",
      },
    ],
  },
  {
    name: "Assets (Vídeos, Sons, Imagens)",
    links: [
      {
        title: "Pexels",
        url: "https://www.pexels.com/",
        description: "Vídeos e fotos gratuitas em alta qualidade",
      },
      {
        title: "Pixabay",
        url: "https://pixabay.com/",
        description: "Banco de imagens, vídeos e músicas livres de direitos",
      },
      {
        title: "Freesound",
        url: "https://freesound.org/",
        description: "Efeitos sonoros gratuitos para edição",
      },
    ],
  },
  {
    name: "Tutoriais e Comunidade",
    links: [
      {
        title: "School of Motion",
        url: "https://www.schoolofmotion.com/",
        description: "Cursos e artigos sobre motion design e After Effects",
      },
      {
        title: "Video Copilot",
        url: "https://www.videocopilot.net/",
        description: "Tutoriais avançados de efeitos visuais e composição",
      },
      {
        title: "r/AfterEffects",
        url: "https://www.reddit.com/r/AfterEffects/",
        description: "Comunidade ativa para tirar dúvidas e compartilhar projetos",
      },
    ],
  },
  {
    name: "Ferramentas Complementares",
    links: [
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
      {
        title: "Render Garden",
        url: "https://www.renderoutgarden.com/",
        description: "Plugin para acelerar renderizações no After Effects",
      },
    ],
  },
];
