import { DeveloperGuard } from "@guards/developer.guard";
import { UseGuards } from "@nestjs/common";

export const DeveloperAuth = () => UseGuards(DeveloperGuard)