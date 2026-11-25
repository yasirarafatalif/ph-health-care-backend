// cspell:ignore bkash
import config from "../config";
import { redisClient } from "./redis";

export const getBkashIdToken = async () => {

  try {
    const IdTokenKey = "bkash:idToken"
    const RefreshTokenKey = "bkash:refreshToken"

    let bkashIdToken = await redisClient.get(IdTokenKey);
    const bkashIdTokenTTL = await redisClient.ttl(IdTokenKey);

    const bkashRefreshToken = await redisClient.get(RefreshTokenKey)
    const bkashRefreshTokenTTL = await redisClient.ttl(RefreshTokenKey)

    if ((bkashIdTokenTTL <= 6000 || !bkashIdToken) && bkashRefreshToken && bkashRefreshTokenTTL > 600) {

      const refreshTokenResponse = await fetch(
        `${config.bkash_app_url}/tokenized-checkout/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config.bkash_username,
            password: config.bkash_password,
          },
          body: JSON.stringify({
            app_key: config.bkash_api_key,
            app_secret: config.bkash_secret,
            refresh_token: bkashRefreshToken
          }),
        },
      );
      if (!refreshTokenResponse.ok) {
        throw new Error("Bkash Access Token Grant Failed")
      }
      const bkashRefreshResult = await refreshTokenResponse.json();

      bkashIdToken = bkashRefreshResult.id_token as string;
      await redisClient.set(IdTokenKey, bkashIdToken, {
        expiration: {
          type: "EX",
          value: 60 * 60
        }
      })

      return bkashIdToken

    }
    if (bkashIdTokenTTL > 600) {
      return bkashIdToken
    }


    const response = await fetch(
      `${config.bkash_app_url}/tokenized-checkout/auth/grant-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config.bkash_username,
          password: config.bkash_password,
        },
        body: JSON.stringify({
          app_key: config.bkash_api_key,
          app_secret: config.bkash_secret,
        }),
      },
    );
    if (!response.ok) {
      throw new Error("Bkash Access Token Grant Failed")
    }
    const result = await response.json();

    await redisClient.set(IdTokenKey, result.id_token, {
      expiration: {
        type: "EX",
        value: 60 * 60
      }
    })
    await redisClient.set(RefreshTokenKey, result.refresh_token, {
      expiration: {
        type: "EX",
        value: 60 * 60 * 24 * 28
      }
    })

  } catch (error: any) {
    throw new Error(error.message)

  }
};
