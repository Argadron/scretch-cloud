import { Test, TestingModule } from "@nestjs/testing"
import { FileService } from "./file.service"
import { UploadFileDto } from "./dto/upload-file.dto"
import { response } from "express"
import { Observable } from "rxjs"

describe(`File Service`, () => {
    let service: FileService
    const mockUploadFileData = {
        storageName: "mockStorage",
        file: "megaFile"
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FileService,
                {
                    provide: "FILE_CLIENT",
                    useValue: {
                        send: jest.fn().mockImplementation((cmdObject: Record<string, string>, data) => {
                            switch (cmdObject.cmd) {
                                case "upload_file_cmd":
                                    return new Observable((subscriber) => subscriber.next({ id: 1, fileName: "createdMockFile" }))
                                case "get_file_cmd": 
                                    return {
                                        subscribe: jest.fn() 
                                    }
                                case "get_file_by_developer_cmd":
                                    return {
                                        subscribe: jest.fn() 
                                    }
                            }
                        }),
                        emit: jest.fn().mockImplementation((eventObj: Record<string, string>, data) => new Observable((subscriber) => subscriber.next(undefined)))
                    }
                }
            ]
        }).compile()

        service = module.get<FileService>(FileService)
    })

    it(`Upload file test`, async () => {
        expect(await service.upload(mockUploadFileData as unknown as UploadFileDto, { originalname: "superName.png" } as unknown as Express.Multer.File, 1)).toStrictEqual({ id: 1, fileName: "createdMockFile" })
    })

    it(`Get file test`, async () => {
        expect(await service.getFile(1, `myFile`, response)).toBeUndefined()
    })

    it(`Delete file test`, async () => {
        expect(await service.deleteFile(1, `myFile`)).toBeUndefined()
    })

    it(`Get file by developer test`, async () => {
        expect(await service.getFileByDeveloper(1, 1, "mocked-file-app-name", response)).toBeUndefined()
    })

    it(`Delete file by developer test`, async () => {
        expect(await service.deleteFileByDeveloper(1, 1, "mocked-file-app-name")).toBeUndefined()
    })
})