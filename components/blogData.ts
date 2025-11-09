export interface NewsItem {
  title: string;
  source: string;
  link: string;
  publishedDate: string; // YYYY-MM-DD
}

export interface NewsCategory {
  description: string;
  items: NewsItem[];
}

export const blogData: Record<string, NewsCategory> = {
  "Pets e Tutores": {
    description: "Dicas, cuidados e notícias para garantir o bem-estar e a saúde dos seus animais de estimação.",
    items: [
      { title: "Os 10 cuidados essenciais para a saúde do seu cão idoso", source: "Canal do Pet", link: "https://canaldopet.ig.com.br/cuidados/saude/2022-09-19/cuidados-essenciais-para-a-saude-do-cao-idoso.html", publishedDate: "2024-07-15" },
      { title: "Gatos e apartamentos: como criar um ambiente feliz e seguro", source: "Petz", link: "https://www.petz.com.br/blog/gatos/gato-em-apartamento-dicas/", publishedDate: "2024-07-22" },
      { title: "Entendendo a ansiedade de separação em cães", source: "Portal do Dog", link: "https://portaldodog.com.br/cachorros/saude/ansiedade-de-separacao-em-caes/", publishedDate: "2024-06-30" },
    ],
  },
  "Pecuária de Corte": {
    description: "Informações técnicas, manejo e inovações para a produção de carne bovina de forma eficiente e sustentável.",
    items: [
      { title: "Manejo de pastagens para máxima produtividade na seca", source: "Giro do Boi", link: "https://www.girodoboi.com.br/destaques/manejo-de-pastagem-na-seca-veja-o-que-e-essencial-para-nao-perder-produtividade/", publishedDate: "2024-08-01" },
      { title: "Novas tecnologias de melhoramento genético em Nelore", source: "Canal Rural", link: "https://www.canalrural.com.br/pecuaria/gado-de-corte/melhoramento-genetico-do-nelore-veja-o-que-ha-de-novo-na-pecuaria/", publishedDate: "2024-07-28" },
      { title: "Protocolos de IATF: Maximizando a eficiência reprodutiva", source: "Compre Rural", link: "https://www.comprerural.com/protocolos-de-iatf-maximizando-a-eficiencia-reprodutiva-na-pecuaria/", publishedDate: "2024-07-18" },
    ],
  },
  "Pecuária de Leite": {
    description: "As melhores práticas e tecnologias para otimizar a produção de leite com foco em qualidade e bem-estar animal.",
    items: [
      { title: "Qualidade do leite: da ordenha ao resfriamento", source: "MilkPoint", link: "https://www.milkpoint.com.br/artigos/producao-de-leite/qualidade-do-leite-da-ordenha-ao-resfriamento-89825n.aspx", publishedDate: "2024-08-05" },
      { title: "Prevenção e controle da mastite no rebanho", source: "Embrapa", link: "https://www.embrapa.br/busca-de-noticias/-/noticia/26330008/artigo---prevencao-e-controle-da-mastite-no-rebanho", publishedDate: "2024-07-25" },
      { title: "Desafios da nutrição de vacas de alta produção", source: "Revista Leite Integral", link: "https://revistaleiteintegral.com.br/noticia/desafios-da-nutricao-de-vacas-de-alta-producao", publishedDate: "2024-07-11" },
    ],
  },
  "Equinos": {
    description: "Tudo sobre o manejo, saúde, nutrição e bem-estar de cavalos atletas e de lazer.",
    items: [
      { title: "Prevenção de cólicas em cavalos atletas: guia completo", source: "Revista Horse", link: "https://revistahorse.com.br/sindrome-colica-equina-como-prevenir/", publishedDate: "2024-07-29" },
      { title: "Casqueamento e ferrageamento: a base da saúde equina", source: "Canal do Criador", link: "https://canaldocriador.com.br/programas/casqueamento-e-ferrageamento-sao-essenciais-para-a-saude-dos-equinos-confira-as-dicas/", publishedDate: "2024-07-02" },
      { title: "Manejo nutricional do potro em crescimento", source: "Universidade do Cavalo", link: "https://www.universidadedocavalo.com.br/manejo-nutricional-do-potro-em-crescimento/", publishedDate: "2024-06-25" },
    ],
  },
  "Sustentabilidade": {
    description: "Notícias e inovações sobre práticas agropecuárias que respeitam o meio ambiente e promovem a economia de baixo carbono.",
    items: [
      { title: "ILPF: Como integrar lavoura, pecuária e floresta com sucesso", source: "Rede ILPF", link: "https://www.ilpf.com.br/o-que-e-ilpf/", publishedDate: "2024-08-02" },
      { title: "Crédito de carbono na agropecuária: o que o produtor precisa saber", source: "Agro Sustentável", link: "https://blog.agrosustentavel.com.br/credito-de-carbono-na-agropecuaria/", publishedDate: "2024-07-20" },
      { title: "Manejo de dejetos e produção de bioenergia na fazenda", source: "Portal do Agronegócio", link: "https://portaldelagronegocio.com.br/manejo-de-dejetos-na-pecuaria-pode-gerar-energia-e-aumentar-a-renda-do-produtor-rural/", publishedDate: "2024-07-08" },
    ],
  },
};