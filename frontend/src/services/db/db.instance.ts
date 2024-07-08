import ky from "ky";

export const dbInstance = ky.create({
  credentials: "include",
  prefixUrl: "http://localhost:3000",
});
