import type { TokenResponse } from "./oauth_service.ts";
import { stringOrEmpty } from "./default_values.ts";

export interface PublicAuthUser {
  id: string;
  name: string;
  account: string;
}

export interface Session {
  userId: string;
  userName?: string;
  userAccount?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SessionTokenRefresh {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export function buildSessionFromTokenResponse(
  tokenResponse: TokenResponse,
  now = Date.now(),
): Session {
  return {
    userId: tokenResponse.user.id,
    userName: tokenResponse.user.name,
    userAccount: tokenResponse.user.account,
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: now + tokenResponse.expires_in * 1000,
  };
}

export function buildTimestampedSessionFromTokenResponse({
  tokenResponse,
  now = Date.now,
}: {
  tokenResponse: TokenResponse;
  now?: () => number;
}): Session {
  return buildSessionFromTokenResponse(tokenResponse, now());
}

export function buildPublicUserFromTokenResponse(
  tokenResponse: TokenResponse,
): PublicAuthUser {
  return {
    id: tokenResponse.user.id,
    name: tokenResponse.user.name,
    account: tokenResponse.user.account,
  };
}

export function buildPublicUserFromSession(session: Session): PublicAuthUser {
  return {
    id: session.userId,
    name: stringOrEmpty(session.userName),
    account: stringOrEmpty(session.userAccount),
  };
}

export function applySessionTokenRefresh(
  session: Session,
  refresh: SessionTokenRefresh,
): Session {
  return {
    ...session,
    accessToken: refresh.accessToken,
    refreshToken: refresh.refreshToken,
    expiresAt: refresh.expiresAt,
  };
}
