import supertest from "supertest";
import { expect } from "chai";

import { config } from "../src/utils/config.js";
import { createApp } from "../src/main.js";
import { closeDB } from "../src/utils/database.js";

describe("Rutas de Usuarios", function () {
  let user_id = "678d66260f1e74d91f0d574b"; // Reemplazar con un ID válido en tu BD
  let role_id = "678c7303722baee0f40be4b8"; // Reemplazar con un ID válido de roles en tu BD
  let current_user;
  let server, request;

  before(() => {
    const app = createApp(config);
    server = app.listen(config.PORT);
    request = supertest(app);
  });

  after(() => {
    server.close();
    closeDB();
  });

  describe("POST /users", function () {
    it("Debería crear un usuario y retornar código 201", async () => {
      const username = `testuser-${Date.now()}`;
      const newUser = {
        username: username,
        name: `${username} User`,
        email: `${username}@example.com`,
        password: "securepassword",
      };

      const response = await request.post("/api/v1/users").send(newUser);
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property("data");
      expect(response.body.data).to.include.keys(
        "id",
        "username",
        "email",
        "name"
      );
      current_user = response.body.data.id;
    });
  });

  describe("GET /users", function () {
    it("Debería retornar una lista de usuarios con código 200", async () => {
      const response = await request.get("/api/v1/users");
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data").that.is.an("array");
    });
  });

  describe("GET /users/:id", function () {
    it("Debería retornar un usuario específico con código 200", async () => {
      const userId = user_id;
      const response = await request.get(`/api/v1/users/${userId}`);
      expect(response.status).to.equal(200);
      expect(response.body)
        .to.have.property("data")
        .that.includes.keys("_id", "username", "email", "name");
    });
  });

  describe("PUT /users/:id", function () {
    it("Debería actualizar un usuario y retornar código 200", async () => {
      const userId = current_user; // Reemplazar con un ID válido en tu BD
      const updatedData = {
        name: "Updated Test User",
      };

      const response = await request
        .put(`/api/v1/users/${userId}`)
        .send(updatedData);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data");
    });
  });

  describe("DELETE /users/:id", function () {
    it("Debería eliminar un usuario y retornar código 200", async () => {
      const userId = current_user;

      const response = await request.delete(`/api/v1/users/${userId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data");
    });
  });

  describe("POST /users/:id/roles", function () {
    it("Debería asignar roles a un usuario y retornar código 200", async () => {
      const userId = user_id;
      const rolesData = {
        role_ids: [role_id],
      };

      const response = await request
        .post(`/api/v1/users/${userId}/roles`)
        .send(rolesData);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data");
    });
  });

  describe("POST /users/:id/toggle-2fa", function () {
    it("Debería activar/desactivar 2FA y retornar código 200", async () => {
      const userId = user_id;
      const toggleData = {
        enable: false,
      };

      const response = await request
        .post(`/api/v1/users/${userId}/togle-2fa`)
        .send(toggleData);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data");
    });
  });

  describe("PUT /users/:id/status", function () {
    it("Should activate/deactivate user status", async function () {
      const statusData = { active: false };

      const response = await request
        .put(`/api/v1/users/${user_id}/status`)
        .send(statusData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data");
      expect(response.body.data.message).to.include("Usuario desactivado");
      expect(response.body.data.active).to.be.false;
    });

    it("Should reactivate user status", async function () {
      const statusData = { active: true };

      const response = await request
        .put(`/api/v1/users/${user_id}/status`)
        .send(statusData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data");
      expect(response.body.data.message).to.include("Usuario activado");
      expect(response.body.data.active).to.be.true;
    });
  });

  describe("POST /users/:id/reset-2fa", function () {
    it("Should reset two-factor authentication", async function () {
      const statusData = { active: true };
      const response = await request
        .post(`/api/v1/users/${user_id}/reset-2fa`)
        .send(statusData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data");
      expect(response.body.data.message).to.include(
        "Autenticación de dos factores reiniciada"
      );
    });
  });

  describe("POST /users/:id/change-password", function () {
    it("Should change user password", async function () {
      let userId = "67946d48c676fe500dc28ef7"; // Cambiar ID
      let testPassword = "newSecurePassword123!"; 
      let currentPassword = "newSecurePassword123!";

      const passwordChangeData = {
        currentPassword: currentPassword,
        newPassword: testPassword,
      };

      const response = await request
        .post(`/api/v1/users/${userId}/change-password`)
        .send(passwordChangeData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data");
      expect(response.body.data.message).to.include("Contraseña actualizada");
    });
  });
});
