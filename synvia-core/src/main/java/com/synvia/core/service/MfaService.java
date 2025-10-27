package com.synvia.core.service;

import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Instant;

@Service
public class MfaService {

    private static final String HMAC_ALGORITHM = "HmacSHA1";
    private static final int DEFAULT_SECRET_SIZE = 20;
    private static final int OTP_DIGITS = 6;
    private static final int TIME_STEP_SECONDS = 30;
    private static final int ALLOWED_TIME_WINDOWS = 1;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Base32 base32 = new Base32();

    public String generateNewSecret() {
        byte[] buffer = new byte[DEFAULT_SECRET_SIZE];
        secureRandom.nextBytes(buffer);
        return base32.encodeToString(buffer).replace("=", "");
    }

    public boolean isCodeValid(String secret, String code) {
        if (secret == null || secret.isBlank() || code == null || code.isBlank()) {
            return false;
        }

        long parsedCode;
        try {
            parsedCode = Long.parseLong(code);
        } catch (NumberFormatException ex) {
            return false;
        }

        long currentInterval = Instant.now().getEpochSecond() / TIME_STEP_SECONDS;

        for (int i = -ALLOWED_TIME_WINDOWS; i <= ALLOWED_TIME_WINDOWS; i++) {
            long hash = generateCode(secret, currentInterval + i);
            if (hash == parsedCode) {
                return true;
            }
        }
        return false;
    }

    public String buildOtpAuthUrl(String issuer, String account, String secret) {
        String safeIssuer = urlEncode(issuer);
        String safeAccount = urlEncode(account);
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&digits=%d&period=%d",
                safeIssuer, safeAccount, secret, safeIssuer, OTP_DIGITS, TIME_STEP_SECONDS);
    }

    private long generateCode(String secret, long timeStep) {
        byte[] decodedSecret = base32.decode(secret);
        byte[] timeBytes = ByteBuffer.allocate(8).putLong(timeStep).array();

        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(decodedSecret, HMAC_ALGORITHM));
            byte[] hash = mac.doFinal(timeBytes);

            int offset = hash[hash.length - 1] & 0x0F;
            long truncatedHash = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);

            return truncatedHash % (long) Math.pow(10, OTP_DIGITS);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao gerar código TOTP", e);
        }
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
