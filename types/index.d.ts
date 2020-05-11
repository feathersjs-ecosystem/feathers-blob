// TypeScript Version: 3.0

import { AbstractBlobStore } from 'abstract-blob-store';
import { Params, Id } from '@feathersjs/feathers';

export = feathersBlob;

declare function feathersBlob(config: feathersBlob.InitOptions): feathersBlob.Service;

interface UnknownObject {
  [propName: string]: any;
}

interface RemoveResultWithCustomIdParam {
  [idParam: string]: string;
}

interface RemoveResultWithId {
  id: string;
}

interface CreateUriBody {
  uri: string;
}

interface CreateBufferBody {
  buffer: Buffer;
  contentType: string;
}

declare namespace feathersBlob {
  interface InitOptions {
    returnBuffer?: boolean;
    Model: AbstractBlobStore;
    id?: string;
  }

  interface BlobParams extends Params {
    s3?: UnknownObject;
  }

  type CreateBody = CreateUriBody | CreateBufferBody;

  type RemoveResult = RemoveResultWithId | RemoveResultWithCustomIdParam;

  interface BlobResult {
    id?: string;
    buffer?: Buffer;
    uri?: string;
    size: number;
    [idParam: string]: any;
  }

  interface Service {
    extend(obj: UnknownObject): Service;

    get(id: Id, params?: BlobParams): Promise<BlobResult>;

    create(body: CreateBody, params?: BlobParams): Promise<BlobResult>;

    remove(id: Id, params?: Params): Promise<RemoveResult | RemoveResultWithCustomIdParam>;
  }
}
