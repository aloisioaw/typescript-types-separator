/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Category {
  id?: string;
  name: string;
  type: CategoryType;
  creationDate?: string;
  modificationDate?: string;
}

export enum CategoryType {
  EXPENSE = "EXPENSE",
  EARNING = "EARNING",
}

export type GetAllResponse = Category[];

export type CreateCategoryResponse = Category;

export interface FailResponse {
  success: boolean;
  error: string;
}
