import { Test, TestingModule } from "@nestjs/testing"
import { FileController } from "./file.controller"
import { FileService } from "./file.service"
import { JwtGuard } from "@guards/jwt.guard"
import { ExecutionContext } from "@nestjs/common"
import { Request, response } from "express"
import { UploadFileDto } from "./dto/upload-file.dto"

describe(`File controller`, () => {
    let controller: FileController
    const mockUploadFileData = {
        storageName: "mockStorage",
        file: "megaFile"
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FileController],
            providers: [
                {
                    provide: FileService,
                    useValue: {
                        upload: jest.fn().mockResolvedValue({ id: 1, fileName: "superFile" }),
                        getFile: jest.fn().mockResolvedValue(null),
                        deleteFile: jest.fn().mockResolvedValue(null)
                    }
                }
            ]
        }).overrideGuard(JwtGuard).useValue({
            canActivate: (ctx: ExecutionContext) => {
                const request = ctx.switchToHttp().getRequest<Request>()

                request.user = {
                    id: 1
                }

                return true
            }
        }).compile()

        controller = module.get<FileController>(FileController)
    })

    it(`Upload file test`, async () => {
        expect(await controller.upload(mockUploadFileData as unknown as UploadFileDto, {} as unknown as Express.Multer.File, 1)).toStrictEqual({ id: 1, fileName: "superFile" })
    })

    it(`Get file test`, async () => {
        expect(await controller.getFile(1, `myFile`, response)).toBe(null)
    })

    it(`Delete file test`, async () => {
        expect(await controller.deleteFile(1, `myFile`)).toBe(null)
    })
})