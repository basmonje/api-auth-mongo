import supertest from "supertest";
import { expect } from "chai";

import { config } from "../src/utils/config.js";
import { createApp } from "../src/main.js";
import { closeDB } from "../src/utils/database.js";

describe("Ruta de sesiones", function () {
  let server, request;
  let userId, sessionId;

  before(async function () {
    const app = createApp(config);
    server = app.listen(config.PORT);
    request = supertest(app);

    userId = "678d66260f1e74d91f0d574b";
  });

  after(function () {
    server.close();
    closeDB();
  });

  describe("GET /:userId/active", function () {
    it("Debe enumerar las sesiones activas de un usuario", async function () {
      const response = await request.get(`/api/v1/sessions/${userId}/active`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data").that.is.an("array");

      if (response.body.data.length > 0) {
        const session = response.body.data[0];
        expect(session).to.include.keys("_id", "user_agent", "last_activity");

        sessionId = session._id;
      }
    });
  });

  describe("DELETE /:sessionId", function () {
    it("Debería revocar una sesión específica", async function () {
      if (!sessionId) {
        this.skip();
      }

      const response = await request.delete(`/api/v1/sessions/${sessionId}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data");
      expect(response.body.data)
        .to.have.property("message")
        .that.includes("Sesión revocada");
    });
  });

  describe("DELETE /:userId/all", function () {
    it("Debería revocar todas las sesiones para un usuario.", async function () {
      const response = await request.delete(`/api/v1/sessions/${userId}/all`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("data");
      expect(response.body.data)
        .to.have.property("message")
        .that.includes("Se revocaron");
      expect(response.body.data)
        .to.have.property("totalRevoked")
        .that.is.a("number");
    });
  });
});
