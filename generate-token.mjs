import { SignJWT } from 'jose';

const secret = new TextEncoder().encode("eb7a0518fba09a8266e076f9a929adb9ef8c1519444eddf6e36b1ab0dfa65fe8c373f17e544f7544dc953433198a48f849bd236d2d2d936a69b5984c43672c91");

const alg = 'HS256';

const jwt = await new SignJWT({ orgId: 'org_123', role: 'admin' })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);

console.log(jwt);
