import supertest from "supertest";
import { App } from "../app";
import { userRepository } from "../repositories/user.repository";
import jwt from "jsonwebtoken";
import { v4 as uuidv4, validate } from 'uuid';
import { hashSync } from 'bcryptjs';

require('dotenv').config();

const app = new App(3030).app;

jest.mock("../repositories/user.repository");

describe("Testing endpoints Users", () => {

    const endpointUrl = "/users";
    const user = {
        id: 1,
        email: "eldiego@yahoo.com",
        name: "eldiegote",
        password: hashSync("eldiego123", 10),
        role: "ADMIN",
        createdAt: "",
        updatedAt: "",
        deletedAt: null,
    }
    const token = jwt.sign({ role: "ADMIN", email: "", invalidTokenId: uuidv4() }, String(process.env.SECRETKEY_JWT), { expiresIn: 60 * 15 });
    const invalidToken = jwt.sign({ role: "ADMIN", email: "", invalidTokenId: uuidv4() }, "secretofalso", { expiresIn: 60 * 15 });
    const invalidRoleToken = jwt.sign({ role: "CUSTOMER", email: "", invalidTokenId: uuidv4() }, String(process.env.SECRETKEY_JWT), { expiresIn: 60 * 15 });

    describe("POST /login", () => {
        it("devuelve status 200 - token de acceso e info del usuario", async () => {
            //@ts-ignore
            jest.spyOn(userRepository, "DBreadUserByEmail").mockResolvedValue(user);
            const response = await supertest(app)
                .post(`${endpointUrl}/login`)
                .send({
                    email: "eldiego@yahoo.com",
                    password: "eldiego123"
                })
            expect(response.statusCode).toBe(200)
            expect(response.body.status).toEqual('success')
            expect(response.body.message).toEqual("Usuario autenticado")
            expect(response.body.user).toEqual(user.email)
            expect(response.body.token).toBeDefined;
        })

        it("devuelve status 401 no auth - credenciales incorrectas", async () => {
            //@ts-ignore
            jest.spyOn(userRepository, "DBreadUserByEmail").mockResolvedValue(user);
            const response = await supertest(app)
                .post(`${endpointUrl}/login`)
                .send({
                    email: "eldiego@yahoo.com",
                    password: "passincorrecta"
                })
            expect(response.statusCode).toBe(401)
            expect(response.body.status).toEqual('error')
            expect(response.body.error).toEqual("Credenciales incorrectas")
        })

        it("devuelve status 401 no auth - mail no registrado", async () => {
            //@ts-ignore
            jest.spyOn(userRepository, "DBreadUserByEmail").mockResolvedValue(null);
            const response = await supertest(app)
                .post(`${endpointUrl}/login`)
                .send({
                    email: "mail_no_registrado@yahoo.com",
                    password: "passincorrecta"
                })
            expect(response.statusCode).toBe(404)
            expect(response.body.status).toEqual('error')
            expect(response.body.error).toEqual("El email ingresado no está registrado")
        })
    })
    describe("PUT /change-password", () => {
        beforeEach(() => {
            //@ts-ignore
            jest.spyOn(userRepository, "DBreadUserByEmail").mockResolvedValue(user);
            //@ts-ignore
            jest.spyOn(userRepository, "DBupdateUserPassword").mockResolvedValue(user);
        })

        it("devuelve status 200 - contraseña actualizada", async () => {
            const response = await supertest(app)
                .put(`${endpointUrl}/change-password`)
                .send({
                    previousPassword: "eldiego123",
                    newPassword: "12345678",
                    confirmNewPassword: "12345678"
                })
                .set('Authorization', `Bearer ${token}`)
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toEqual(`La contraseña del usuario ${user.email} se actualizó con éxito`)
        })
        it("devuelve status 403 - contraseña previa del usuario incorrecta", async () => {
            const response = await supertest(app)
                .put(`${endpointUrl}/change-password`)
                .send({
                    previousPassword: "incorrectaaa",
                    newPassword: "12345678",
                    confirmNewPassword: "12345678"
                })
                .set('Authorization', `Bearer ${token}`)
            expect(response.statusCode).toBe(403);
            expect(response.body.error).toEqual(`La contraseña anterior es incorrecta`)
        })
        it('devuelve status 401 no autorizado - no token', async () => {
            const response = await supertest(app)
                .put(`${endpointUrl}/change-password`)
            expect(response.status).toBe(401);
            expect(response.body.status).toEqual('error')
            expect(response.body.message).toEqual('No token provided');
        });

    })



})