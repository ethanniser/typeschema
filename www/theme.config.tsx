import type {DocsThemeConfig} from 'nextra-theme-docs';

import Image from 'next/image';

const logo = (
  <div className="select-none flex flex-row items-center">
    <Image src="/logo.png" width={32} height={32} alt="TypeSchema" />
    <span className="font-bold ltr:ml-2 rtl:mr-2">TypeSchema</span>
  </div>
);

const config: DocsThemeConfig = {
  darkMode: false,
  docsRepositoryBase: 'https://github.com/decs/typeschema/www',
  logo,
  project: {
    link: 'https://github.com/decs/typeschema',
  },
};

export default config;
