import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import {UpdateUserInput} from './inputs /update-user.input';
import { UserEntity} from './user.entity';
import {UserService} from './user.service';
import {ForbiddenException, ParseIntPipe} from "@nestjs/common";
import {User} from "../common/decorators/user.decorator";
import {NEED_TO_BE_MODERATOR_OR_CREATOR} from "../common/const/global";
import {IsPublic} from "../common/decorators/public.decorator";

@Resolver('User')
export class UserResolver {
    constructor(private readonly userService: UserService) {
    }

    @Mutation(() => UserEntity)
    async updateUser(
        @Args('updateUser') updateUserInput: UpdateUserInput,
        @User() user: UserEntity
    ): Promise<UserEntity> {
        if (!await this.userService.isCreatorOrModerator(updateUserInput.id, user)) {
            throw new ForbiddenException(NEED_TO_BE_MODERATOR_OR_CREATOR)
        }
        return await this.userService.updateById(updateUserInput);
    }

    @Mutation(() => Number)
    async removeUser(@Args('id', ParseIntPipe) id: number, @User() user: UserEntity): Promise<number> {
        if (!await this.userService.isCreatorOrModerator(id, user)) {
            throw new ForbiddenException(NEED_TO_BE_MODERATOR_OR_CREATOR)
        }
        return await this.userService.removeById(id);
    }
    @IsPublic()
    @Query(() => Number, {name: 'countUser'})
    async getCount(): Promise<number> {
        return this.userService.getCount()
    }
    @IsPublic()
    @Query(() => UserEntity)
    async getOneUser(@Args('id',ParseIntPipe) id: number): Promise<UserEntity> {
        return await this.userService.findById(id);
    }
    @IsPublic()
    @Query(() => [UserEntity])
    async getAllUsers(): Promise<UserEntity[]> {
        return await this.userService.findMany();
    }
}
