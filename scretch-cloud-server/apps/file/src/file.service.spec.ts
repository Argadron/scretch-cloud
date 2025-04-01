import { Test, TestingModule } from "@nestjs/testing";
import { FileService } from "./file.service"
import { AppConfigModule } from "@app/app-config";
import { Prisma, FileTypeEnum } from "@prisma/client";
import { DatabaseService } from "@app/database";
import { UploadFileDto } from "apps/gateway/src/domain/file/dto/upload-file.dto";

describe(`File Serivce`, () => {
    let service: FileService;
    const mockUploadFileData = {
        storageName: "mockStorage",
        file: "megaFile"
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppConfigModule],
            providers: [
                FileService,
                {
                    provide: DatabaseService,
                    useValue: {
                        file: {
                            findUnique: jest.fn().mockImplementation((args: Prisma.FileAggregateArgs) => {
                                return {
                                    fileType: FileTypeEnum.PROFILE,
                                    fileName: "superFile",
                                    fileOriginalName: "superFile"
                                }
                            }),
                            create: jest.fn().mockResolvedValue({ id: 1, fileName: "createdMockFile" }),
                            delete: jest.fn().mockResolvedValue({ id: 1, fileName: "deletedMockFile" })
                        },
                        storage: {
                            findUnique: jest.fn().mockImplementation((args: Prisma.StorageAggregateArgs) => {
                                return {
                                    files: [],
                                    size: 50
                                }
                            })
                        },
                        app: {
                            findUnique: jest.fn().mockResolvedValue({
                                storage: {
                                    files: [{ fileName: "mocked-file-app-name" }]
                                }
                            })
                        }
                    }
                },
            ]
        }).compile()

        service = module.get<FileService>(FileService)
    })

    it(`Upload file test`, async () => {
        expect(await service.upload(mockUploadFileData as unknown as UploadFileDto, { originalname: "superName.png" } as unknown as Express.Multer.File, 1)).toStrictEqual({ id: 1, fileName: "createdMockFile" })
    })

    it(`Get file test`, async () => {
        expect(await service.getFile(1, `myFile`)).toBeDefined()
    })

    it(`Delete file test`, async () => {
        expect(await service.deleteFile(1, `myFile`)).toBeUndefined()
    })

    it(`Get file by developer test`, async () => {
        expect(await service.getFileByDeveloper(1, 1, "mocked-file-app-name")).toBeDefined()
    })

    it(`Delete file by developer test`, async () => {
        expect(await service.deleteFileByDeveloper(1, 1, "mocked-file-app-name")).toBeUndefined()
    })
})