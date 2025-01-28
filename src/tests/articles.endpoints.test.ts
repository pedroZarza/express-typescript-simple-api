import supertest from "supertest";
import { App } from "../app";
import { articlesRepository } from "../repositories/articles.repository";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';


require('dotenv').config();


const app = new App(3030).app;

jest.mock("../repositories/articles.repository");

describe("Testing endpoints Artículos", () => {
    const endpointUrl = "/articulos";
    const token = jwt.sign({ role: "ADMIN", email: "", invalidTokenId: uuidv4() }, String(process.env.SECRETKEY_JWT), { expiresIn: 60 * 15 });
    const invalidToken = jwt.sign({ role: "ADMIN", email: "", invalidTokenId: uuidv4() }, "secretofalso", { expiresIn: 60 * 15 });
    const invalidRoleToken = jwt.sign({ role: "CUSTOMER", email: "", invalidTokenId: uuidv4() }, String(process.env.SECRETKEY_JWT), { expiresIn: 60 * 15 });
    const validArticle = {
        "Alias": "aliastest123",
        "Numero_de_Parte": "06190001",
        "Detalle": "test_descripción",
        "Precio": 946.20,
        "Moneda": "DOLARES",
        "Cotizacion": "7.90",
        "Tasa_IVA": "12.00",
        "Tasa_Impuestos_Internos": "0.00",
        "Stock": 3,
        "Marca": "HUAWEI",
        "Categoria": "POWER DISTRIBUTION",
        "DescripcionTest": "aaaa"
    }

    describe('POST /articles', () => {
        it('devuelve status 201 si el artículo se creó con éxito', async () => {
            //@ts-ignore
            jest.spyOn(articlesRepository, "DBsaveArticle").mockResolvedValue(validArticle);
            //@ts-ignore
            jest.spyOn(articlesRepository, "DBreadArticleByAlias").mockResolvedValue(null);

            const response = await supertest(app)
                .post(endpointUrl)
                .send(validArticle)
                .set('Authorization', `Bearer ${token}`)

            expect(response.status).toBe(201);
            expect(response.body.status).toEqual('success')
            expect(response.body.message).toEqual('El artículo con alias aliastest123 se creó con éxito');
        });

        it('devuelve status 409 si el alias con el que se quiere crear el producto ya existe en la db', async () => {
            //@ts-ignore
            jest.spyOn(articlesRepository, "DBreadArticleByAlias").mockResolvedValue(validArticle);

            const response = await supertest(app)
                .post(endpointUrl)
                .send(validArticle)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(409);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toEqual('El alias ingresado ya existe en la base de datos');
        });

        it('devuelve status 500 si ocurre un error inesperado al escribir el producto', async () => {
            // Mock para forzar un error inesperado
            jest.spyOn(articlesRepository, "DBreadArticleByAlias").mockRejectedValue(new Error('Error inesperado'));


            const response = await supertest(app)
                .post(endpointUrl)
                .send(validArticle)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.body.status).toBe('error')
            expect(response.body.message).toBe("Internal server error")
        });

        it('devuelve status 401 no autorizado - no token', async () => {
            const response = await supertest(app)
                .post(endpointUrl)
                .send(validArticle)
            expect(response.status).toBe(401);
            expect(response.body.status).toEqual('error')
            expect(response.body.message).toEqual('No token provided');
        });
        it('devuelve status 401 no autorizado - token invalido', async () => {
            const response = await supertest(app)
                .post(endpointUrl)
                .send(validArticle)
                .set('Authorization', `Bearer ${invalidToken}`);
            expect(response.status).toBe(401);
            expect(response.body.status).toEqual('error')
            expect(response.body.message).toEqual('No autentificado / token invalido');
        });
        it('devuelve status 403 no autorizado -', async () => {
            const response = await supertest(app)
                .post(endpointUrl)
                .send(validArticle)
                .set('Authorization', `Bearer ${invalidRoleToken}`);
            expect(response.status).toBe(403);
            expect(response.body.status).toEqual('error')
            expect(response.body.message).toEqual('No autorizado');
        });
    });


    describe("GET /articles", () => {
        it('devuelve status 200 y artículos', async () => {
            //@ts-ignore
            jest.spyOn(articlesRepository, "DBreadAllArticles").mockResolvedValue([validArticle]);
            const response = await supertest(app)
                .get(endpointUrl)
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(200)
            expect(response.body.status).toBe('success')
            expect(response.body.articulos).toEqual([validArticle]);
        });

        it('devuelve status 200 (no hay artículos)', async () => {
            jest.spyOn(articlesRepository, "DBreadAllArticles").mockResolvedValue([]);
            const response = await supertest(app)
                .get(endpointUrl)
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(200)
            expect(response.body.status).toBe('success')
            expect(response.body.articulos).toEqual("No se encontraron artículos en la DB");
        });

        it('devuelve status 200 y artículo', async () => {
            //@ts-ignore
            jest.spyOn(articlesRepository, "DBreadArticleByAlias").mockResolvedValue(validArticle);
            const response = await supertest(app)
                .get(`${endpointUrl}/aliastest123`)
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(200)
            expect(response.body.status).toBe('success')
            expect(response.body.article).toEqual(validArticle);
        })

        it('devuelve status 404 artículo no encontrado', async () => {
            //@ts-ignore
            jest.spyOn(articlesRepository, "DBreadArticleByAlias").mockResolvedValue(null);
            const alias = "alias-inexistente";
            const response = await supertest(app)
                .get(`${endpointUrl}/${alias}`)
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(404)
            expect(response.body.status).toBe('error')
            expect(response.body.message).toEqual("El alias ingresado no existe");
        })

        it('devuelve status 200 y los productos del la marca', async () => {
            //@ts-ignore
            jest.spyOn(articlesRepository, "DBreadAllArticlesByMarca").mockResolvedValue([validArticle]);
            const marca = "marca-existente"
            const response = await supertest(app)
                .get(`${endpointUrl}/marca/${marca}`)
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(200)
            expect(response.body.status).toBe('success')
            expect(response.body.articulos).toEqual([validArticle]);
        })
        it('devuelve status 404 marca no encontrada', async () => {
            //@ts-ignore
            jest.spyOn(articlesRepository, "DBreadAllArticlesByMarca").mockResolvedValue([]);
            const marca = "marca-inexistente"
            const response = await supertest(app)
                .get(`${endpointUrl}/marca/${marca}`)
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(404)
            expect(response.body.status).toBe('error')
            expect(response.body.message).toEqual(`Marca ${marca} no encontrada`);
        })
    })
})




