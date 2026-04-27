declare module 'pdfmake/js/Printer' {
  import { TDocumentDefinitions } from 'pdfmake/interfaces';
  class PdfPrinter {
    constructor(
      fontDescriptors: Record<string, Record<string, string>>,
      virtualfs?: unknown,
      urlResolver?: unknown,
    );
    createPdfKitDocument(
      docDefinition: TDocumentDefinitions,
      options?: Record<string, unknown>,
    ): Promise<import('stream').Transform>;
  }
  export default PdfPrinter;
}

declare module 'pdfmake/js/virtual-fs' {
  class VirtualFileSystem {
    writeFileSync(filename: string, content: Buffer): void;
    readFileSync(filename: string, options?: unknown): Buffer;
    existsSync(filename: string): boolean;
  }
  const instance: VirtualFileSystem;
  export default instance;
}

declare module 'pdfmake/js/URLResolver' {
  class URLResolver {
    constructor(fs: unknown);
    resolve(url: string, headers?: Record<string, string>): Promise<void>;
  }
  export default URLResolver;
}

declare module 'pdfmake/build/vfs_fonts' {
  const fonts: Record<string, string>;
  export default fonts;
}
