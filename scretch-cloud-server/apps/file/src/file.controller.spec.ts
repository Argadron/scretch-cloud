import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { UploadFileDto } from './dto/upload-file.dto';

describe('FileController', () => {
  let controller: FileController;
  const mockUploadFileData = {
    storageName: "mockStorage",
    file: "megaFile"
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: {
            upload: jest.fn().mockResolvedValue({ id: 1, fileName: "superFile" }),
            getFile: jest.fn().mockResolvedValue(null),
            deleteFile: jest.fn().mockResolvedValue(null),
            getFileByDeveloper: jest.fn().mockResolvedValue(null),
            deleteFileByDeveloper: jest.fn().mockResolvedValue(null)
          }
        }
      ]
    }).compile();

    controller = app.get<FileController>(FileController);
  });

  it(`Upload file test`, async () => {
    expect(await controller.upload({dto: mockUploadFileData as unknown as UploadFileDto, file: {} as unknown as Express.Multer.File, userId: 1})).toStrictEqual({ id: 1, fileName: "superFile" })
  })

  it(`Get file test`, async () => {
      expect(await controller.getFile({userId: 1, fileName: `myFile`})).toBe(null)
  })

  it(`Delete file test`, async () => {
      expect(await controller.deleteFile({userId: 1, fileName: `myFile`})).toBe(null)
  })
});
