# Browser Developer Tools Network Trace

## GenerateAccessToken

```bash
curl 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateAccessToken' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'X-Goog-Api-Key: AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs' \
  -H 'X-Goog-AuthUser: 0' \
  -H 'Authorization: SAPISIDHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID1PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID3PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78' \
  -H 'Content-Type: application/json+protobuf' \
  -H 'X-User-Agent: grpc-web-javascript/0.1' \
  -H 'Origin: https://aistudio.google.com' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzVcHDJSzQPjyOvsAwarm71IuQKbduqv3QdlmzPdGvGVRPEEmlCpTrAdxngPu3l-t_Y2HQ; __Secure-1PSIDCC=AKEyXzXmRjFZJy7OdhDJAozskcDsKXOYBhrCNiYejD5aTa4Lc88W0Cf9VAcYUlHLX-f1BFhW; __Secure-3PSIDCC=AKEyXzUgLODYGlUKK-dyVJI0b3mHyOQjh8bkCRRvMuUK6dZ2Z8GbNQvEtTExhxpPcCXvzR-Obg; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  --data-raw '["users/me"]'
```

Response:
```http
HTTP/3 200 
content-type: application/json+protobuf; charset=UTF-8
strict-transport-security: max-age=10886400; includeSubdomains
vary: Origin
vary: X-Origin
vary: Referer
content-encoding: gzip
date: Sat, 14 Feb 2026 18:19:52 GMT
server: ESF
content-length: 250
x-xss-protection: 0
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
access-control-allow-origin: https://aistudio.google.com
access-control-allow-credentials: true
access-control-expose-headers: vary,vary,vary,content-encoding,date,server,content-length
server-timing: gfet4t7; dur=86
set-cookie: SIDCC=AKEyXzWv6jmD8T_rXOQCVBviI9V-v1yZyqCA4qhCMXLGRR7gryn5lm-dxWsAszwekwBqHooB_g; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; priority=high
set-cookie: __Secure-1PSIDCC=AKEyXzVjlKCfS4UlcltXcQFJ9EqZYbaf0It2-OfRFvD7gypzQmDTn4ltLtWFZfM5pRH8weyB; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high
set-cookie: __Secure-3PSIDCC=AKEyXzX9UZMCE7mrAB9YB0aoFn2l3ogpJ6wPOTGYvfzo5GPVZglTyiB5i2zr7LUlhyMnTlsNtw; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high; SameSite=none
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
expires: Sat, 14 Feb 2026 18:19:52 GMT
cache-control: private

["ya29.a0ATkoCc5KuD8uHXQsrwNkhYn0aFWfd_op8xDjfqlosvlTwcCnHsAG-ScBZceseJwx7H9563Alf2-LRNFZIcpJZvOfAlOjnHW0-kELw6pSist5m1uJTP0p3PtMqmEQE1Uzisfxl4m-Qrewd18lvyL42cfxjHq0ZLur2Uzw6d73ZjAsSKlg-NBmsChAsYse68F3pSk6HAHnuup9as8aCgYKAe4SARASFQHGX2MiPlvzY9Ay0bs2-TGNgnCLBw0214"]
```

## ListModels

```bash
curl 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/ListModels' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'X-Goog-Api-Key: AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs' \
  -H 'X-Goog-AuthUser: 0' \
  -H 'Authorization: SAPISIDHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID1PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID3PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78' \
  -H 'Content-Type: application/json+protobuf' \
  -H 'X-User-Agent: grpc-web-javascript/0.1' \
  -H 'Origin: https://aistudio.google.com' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzVcHDJSzQPjyOvsAwarm71IuQKbduqv3QdlmzPdGvGVRPEEmlCpTrAdxngPu3l-t_Y2HQ; __Secure-1PSIDCC=AKEyXzXmRjFZJy7OdhDJAozskcDsKXOYBhrCNiYejD5aTa4Lc88W0Cf9VAcYUlHLX-f1BFhW; __Secure-3PSIDCC=AKEyXzUgLODYGlUKK-dyVJI0b3mHyOQjh8bkCRRvMuUK6dZ2Z8GbNQvEtTExhxpPcCXvzR-Obg; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  --data-raw '[]'
```

Response:
```http
HTTP/3 200 
content-type: application/json+protobuf; charset=UTF-8
strict-transport-security: max-age=10886400; includeSubdomains
vary: Origin
vary: X-Origin
vary: Referer
content-encoding: gzip
date: Sat, 14 Feb 2026 18:19:52 GMT
server: ESF
content-length: 3647
x-xss-protection: 0
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
access-control-allow-origin: https://aistudio.google.com
access-control-allow-credentials: true
access-control-expose-headers: vary,vary,vary,content-encoding,date,server,content-length
server-timing: gfet4t7; dur=76
set-cookie: SIDCC=AKEyXzUI6fPPVzTw8e6mjjcRAgETDl2lCTteFAG_m1XcS3ffd8s6LgCPI3xEewX60AfEaVszmg; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; priority=high
set-cookie: __Secure-1PSIDCC=AKEyXzWMcBzPHMVxPoOYNOLw9At3GEAamnkOaWMmjlsb33n47VRCI2sBoCmGZ4v0rdceIrq3; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high
set-cookie: __Secure-3PSIDCC=AKEyXzUkcetXeoGlPayvSURKldaETIw0QXmZJABiSy_GaLtEau8VcJnHkb2wnSXVOwYoNOmsjw; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high; SameSite=none
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
expires: Sat, 14 Feb 2026 18:19:52 GMT
cache-control: private

[[["models/gemini-3-pro-preview",null,"3-pro-preview-11-2025","Gemini 3 Pro Preview","Gemini 3 Pro Preview",1048576,65536,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[200000,null,2],[null,1,4]]],[[[200000,null,12],[null,1,18]]]],null,null,null,[["gemini-3-pro-preview",["1763481600"],null,["1735804800"]]],null,null,null,["gemini-3-pro-preview",["1763481600"],null,["1735804800"]],"Our most intelligent model with SOTA reasoning and multimodal understanding, and powerful agentic and vibe coding capabilities",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/gemini-3"],null,null,null,null,null,null,null,null,[[[5,1],[1,6],[5,6],[5,3],[6,3]]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[5,13,1,9,48,18,10,3,6,7,43,45,16,28,12,2,8,25,52,23,4],null,null,null,null,null,null,[null,null,null,0,null,3,[1,3]],2,null,[10,17,11]],["models/gemini-3-pro-image-preview",null,"3.0","Nano Banana Pro","Gemini 3 Pro Image Preview",131072,32768,["generateContent","countTokens","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null,null,1,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,2,null,"Text"],[null,1,2,null,"Image (*Output per image)"]]],[[[null,1,12,null,"Text"],[null,1,0.134,null,"Image (*Output per image)"]]]],null,null,null,[["gemini-3-pro-image-preview",["1763650800"],null,["1735804800"]]],null,null,null,["gemini-3-pro-image-preview",["1763650800"],null,["1735804800"]],"State-of-the-art image generation and editing model.",null,null,null,null,"Gemini 3 Pro Image Preview","https://ai.google.dev/gemini-api/docs/models#gemini-3-pro"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[["models/nano-banana-pro",2]],null,null,null,null,null,null,null,[47,1,18,3,21,49,16,12,8,25,23],null,null,null,null,null,null,null,2,null,[10,11,17,15],[1,2,3,4,5,6,7,8,9,10],[1,2,3],2],["models/gemini-3-flash-preview",null,"3-flash-preview-12-2025","Gemini 3 Flash Preview","Gemini 3 Flash Preview",1048576,65536,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.5,1]]],[[[null,1,3,1]]]],null,null,null,[["gemini-3-flash-preview",["1765987200"],null,["1735804800"]]],null,null,null,["gemini-3-flash-preview",["1765987200"],null,["1735804800"]],"Our most intelligent model built for speed, combining frontier intelligence with superior search and grounding.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/gemini-3"],null,null,null,null,null,null,null,null,[[[5,1],[1,6],[5,6],[5,3],[6,3]]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[5,13,1,9,48,18,10,3,6,7,43,45,16,28,12,2,8,25,52,23,4],null,null,null,null,null,null,[null,null,null,0,null,3,[4,1,2,3]],2,null,[10,17,11]],["models/gemini-2.5-flash-image",null,"2.0","Nano Banana","Gemini 2.5 Flash Preview Image",32768,32768,["generateContent","countTokens","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.3,null,"Text"],[null,1,0.3,null,"Image (*Output per image)"]]],[[[null,1,2.5,null,"Text"],[null,1,0.039,null,"Image (*Output per image)"]]]],null,null,null,[["gemini-2.5-flash-image",["1759248000"],null,["1749513600"]]],null,null,null,["gemini-2.5-flash-image",["1759248000"],null,["1749513600"]],"Our state-of-the-art image generation and editing model.",null,null,null,null,"Gemini 2.5 Flash Image","https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[["models/nano-banana",2],["models/gemini-2.5-flash-image-preview",1],["models/gemini-2.5-flash-preview-image",1],["models/gemini-2.0-flash-preview-image-generation",1],["models/gemini-2.0-flash-exp",1],["models/gemini-2.0-flash-exp-image-generation",1]],null,null,null,null,null,null,null,[47,1,18,3,21,16,8,23],null,null,null,null,null,null,null,2,null,[15,17],[1,2,3,4,5,6,7,8,9,10]],["models/gemini-2.5-pro",null,"2.5","Gemini 2.5 Pro","Stable release (June 17th, 2025) of Gemini 2.5 Pro",1048576,65536,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[200000,null,1.25],[null,1,2.5]]],[[[200000,null,10],[null,1,15]]]],null,null,null,[["gemini-2.5-pro",["1750172400"],null,["1735804800"]]],null,null,null,["gemini-2.5-pro",["1750172400"],null,["1735804800"]],"Our previous generation advanced reasoning model, which excels at coding and complex reasoning tasks",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro"],null,null,null,null,null,null,null,null,[[[5,1],[5,6],[1,6]]],null,null,null,null,null,null,null,null,[["models/gemini-2.5-pro-preview-06-05",2],["models/gemini-exp-1206",1],["models/gemini-2.0-pro-exp-02-05",1],["models/gemini-2.5-pro-exp-03-25",1],["models/gemini-2.5-pro-preview-03-25",1],["models/gemini-1.5-pro",1],["models/gemini-2.5-pro-preview-05-06",1]],null,null,null,null,null,null,null,[5,13,1,9,48,18,10,3,6,7,43,45,16,28,12,2,8,25,35,38,23,4],null,null,null,null,null,null,[8192,32768,128,0],2,null,[17]],["models/gemini-flash-latest",null,"Gemini Flash Latest","Gemini Flash Latest","Latest release of Gemini Flash",1048576,65536,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.3,1]]],[[[null,1,2.5,1]]]],null,null,null,[["gemini-flash-latest",["1758819600"],null,["1735804800"]]],null,null,null,["gemini-flash-latest",["1758819600"],null,["1735804800"]],"An alias to our latest Flash model which changes over time.",null,null,null,null,"Points to gemini-2.5-flash-preview-09-2025","https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash"],null,null,null,null,null,null,null,null,[[[5,1],[5,6],[1,6]]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[5,13,1,9,18,10,3,6,7,43,45,16,28,12,2,8,25,35,38,23,4],null,null,null,null,null,null,[8000,24576,0,1],2,null,[17,10]],["models/gemini-flash-lite-latest",null,"Gemini Flash-Lite Latest","Gemini Flash-Lite Latest","Latest release of Gemini Flash-Lite",1048576,65536,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.1]]],[[[null,1,0.4]]]],null,null,null,[["gemini-flash-lite-latest",["1758819600"],null,["1735804800"]]],null,null,null,["gemini-flash-lite-latest",["1758819600"],null,["1735804800"]],"An alias to our latest Flash-Lite model which changes over time.",null,null,null,null,"Points to gemini-2.5-flash-lite-preview-09-2025","https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash-lite"],null,null,null,null,null,null,null,null,[[[5,1],[5,6],[1,6]]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[5,13,1,9,18,10,3,6,7,45,16,28,12,2,8,25,35,38,23,4],null,null,null,null,null,null,[8192,24576,512,1,1],2,null,[17,10]],["models/gemini-2.5-flash",null,"001","Gemini 2.5 Flash","Stable version of Gemini 2.5 Flash, our mid-size multimodal model that supports up to 1 million tokens, released in June of 2025.",1048576,65536,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.3,1]]],[[[null,1,2.5,1]]]],null,null,null,[["gemini-2.5-flash",["1749513600"],null,["1735804800"]]],null,null,null,["gemini-2.5-flash",["1749513600"],null,["1735804800"]],"Our hybrid reasoning model, with a 1M token context window and thinking budgets.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash"],null,null,null,null,null,null,null,null,[[[5,1],[5,6],[1,6]]],null,null,null,null,null,null,null,null,[["models/gemini-2.5-flash-preview-05-20",2],["models/gemini-2.5-flash-preview-04-17",1],["models/gemini-2.0-flash-thinking-exp-1219",1],["models/gemini-2.0-flash-thinking-exp-01-21",1],["models/gemini-1.5-flash",1],["models/gemini-1.5-flash-8b",1],["models/learnlm-2.0-flash-experimental",1],["models/learnlm-1.5-pro-experimental",1]],null,null,null,null,null,null,null,[5,13,1,9,48,18,10,3,6,7,43,45,16,28,12,2,8,25,35,38,23,4],null,null,null,null,null,null,[8000,24576,0,1],2,null,[17]],["models/gemini-2.5-flash-lite",null,"001","Gemini 2.5 Flash-Lite","Stable version of Gemini 2.5 Flash-Lite, released in July of 2025",1048576,65536,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.1]]],[[[null,1,0.4]]]],null,null,null,[["gemini-2.5-flash-lite",["1752537600"],null,["1735804800"]]],null,null,null,["gemini-2.5-flash-lite",["1752537600"],null,["1735804800"]],"Our smallest and most cost effective model, built for at scale usage.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash-lite"],null,null,null,null,null,null,null,null,[[[5,1],[5,6],[1,6]]],null,null,null,null,null,null,null,null,[["models/gemini-2.5-flash-lite-preview-06-17",2]],null,null,null,null,null,null,null,[5,13,1,9,18,10,3,6,7,45,16,28,12,2,8,25,35,38,23,4],null,null,null,null,null,null,[8192,24576,512,1,1],2,null,[17]],["models/gemini-2.0-flash",null,"2.0","Gemini 2.0 Flash","Gemini 2.0 Flash",1048576,8192,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,40,null,null,null,null,null,null,null,null,null,null,null,5,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.1]]],[[[null,1,0.4]]]],null,null,null,[["gemini-2.0-flash",["1738368000"],null,["1722618000"]]],null,null,null,["gemini-2.0-flash",["1738368000"],null,["1722618000"]],"Our second generation multimodal model with great performance across all tasks.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/models#gemini-2.0-flash"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[["models/gemini-2.0-flash-001",2]],null,null,null,null,null,null,null,[5,1,9,18,10,3,6,7,43,44,16,28,12,2,8,23,4],null,null,null,null,null,null,null,2,null,[17]],["models/gemini-2.0-flash-lite",null,"2.0","Gemini 2.0 Flash-Lite","Gemini 2.0 Flash-Lite",1048576,8192,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,40,null,null,null,null,null,null,null,null,null,null,null,5,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.075]]],[[[null,1,0.3]]]],null,null,null,[["gemini-2.0-flash-lite",["1738368000"],null,["1722618000"]]],null,null,null,["gemini-2.0-flash-lite",["1738368000"],null,["1722618000"]],"Our second generation small and cost effective model, built for at scale usage.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/models#gemini-2.0-flash-lite"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[["models/gemini-2.0-flash-lite-preview",1],["models/gemini-2.0-flash-lite-preview-02-05",1],["models/gemini-2.0-flash-lite-001",2]],null,null,null,null,null,null,null,[5,1,18,10,3,6,7,43,16,28,2,8,23,4],null,null,null,null,null,null,null,2,null,[17]],["models/gemini-robotics-er-1.5-preview",null,"1.5-preview","Gemini Robotics-ER 1.5 Preview","Gemini Robotics-ER 1.5 Preview",1048576,65536,["generateContent","countTokens"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[null,null,null,null,[["gemini-robotics-er-1.5-preview"]],null,null,null,["gemini-robotics-er-1.5-preview"],"Gemini Robotics-ER, short for Gemini Robotics-Embodied Reasoning, is a thinking model that enhances robots' abilities to understand and interact with the physical world.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/robotics-overview"],null,null,null,null,null,null,null,null,[[[5,6]]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[5,13,1,9,18,10,3,6,7,43,16,28,12,2,8,25,35,38,23,4],null,null,null,null,null,null,[2000,24576,0,1],2,null,[11,17]],["models/gemini-2.5-flash-native-audio-preview-12-2025",null,"12-2025","Gemini 2.5 Flash Native Audio Preview 12-2025","Gemini 2.5 Flash Native Audio Preview 12-2025",131072,8192,["countTokens","bidiGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.5,null,"Text"],[null,1,3,null,"Audio/Video"]]],[[[null,1,2,null,"Text"],[null,1,12,null,"Audio"]]]],null,null,null,[["gemini-2.5-flash-native-audio-preview-12-2025"]],null,null,null,["gemini-2.5-flash-native-audio-preview-12-2025"],"Our native audio model optimized for higher quality audio outputs with better pacing, voice naturalness, verbosity, and mood.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[[2,5]]],null,null,null,null,null,null,[26,40,39,30,3,16,31,8,25,35,38,4],[["Zephyr","https://gstatic.com/aistudio/voices/samples/Zephyr.wav","Higher",["Bright"]],["Puck","https://gstatic.com/aistudio/voices/samples/Puck.wav","Middle",["Upbeat"]],["Charon","https://gstatic.com/aistudio/voices/samples/Charon.wav","Lower",["Informative"]],["Kore","https://gstatic.com/aistudio/voices/samples/Kore.wav","Middle",["Firm"]],["Fenrir","https://gstatic.com/aistudio/voices/samples/Fenrir.wav","Lower middle",["Excitable"]],["Leda","https://gstatic.com/aistudio/voices/samples/Leda.wav","Higher",["Youthful"]],["Orus","https://gstatic.com/aistudio/voices/samples/Orus.wav","Lower middle",["Firm"]],["Aoede","https://gstatic.com/aistudio/voices/samples/Aoede.wav","Middle",["Breezy"]],["Callirrhoe","https://gstatic.com/aistudio/voices/samples/Callirrhoe.wav","Middle",["Easy-going"]],["Autonoe","https://gstatic.com/aistudio/voices/samples/Autonoe.wav","Middle",["Bright"]],["Enceladus","https://gstatic.com/aistudio/voices/samples/Enceladus.wav","Lower",["Breathy"]],["Iapetus","https://gstatic.com/aistudio/voices/samples/Iapetus.wav","Lower middle",["Clear"]],["Umbriel","https://gstatic.com/aistudio/voices/samples/Umbriel.wav","Lower middle",["Easy-going"]],["Algieba","https://gstatic.com/aistudio/voices/samples/Algieba.wav","Lower",["Smooth"]],["Despina","https://gstatic.com/aistudio/voices/samples/Despina.wav","Middle",["Smooth"]],["Erinome","https://gstatic.com/aistudio/voices/samples/Erinome.wav","Middle",["Clear"]],["Algenib","https://gstatic.com/aistudio/voices/samples/Algenib.wav","Lower",["Gravelly"]],["Rasalgethi","https://gstatic.com/aistudio/voices/samples/Rasalgethi.wav","Middle",["Informative"]],["Laomedeia","https://gstatic.com/aistudio/voices/samples/Laomedeia.wav","Higher",["Upbeat"]],["Achernar","https://gstatic.com/aistudio/voices/samples/Achernar.wav","Higher",["Soft"]],["Alnilam","https://gstatic.com/aistudio/voices/samples/Alnilam.wav","Lower middle",["Firm"]],["Schedar","https://gstatic.com/aistudio/voices/samples/Schedar.wav","Lower middle",["Even"]],["Gacrux","https://gstatic.com/aistudio/voices/samples/Gacrux.wav","Middle",["Mature"]],["Pulcherrima","https://gstatic.com/aistudio/voices/samples/Pulcherrima.wav","Middle",["Forward"]],["Achird","https://gstatic.com/aistudio/voices/samples/Achird.wav","Lower middle",["Friendly"]],["Zubenelgenubi","https://gstatic.com/aistudio/voices/samples/Zubenelgenubi.wav","Lower middle",["Casual"]],["Vindemiatrix","https://gstatic.com/aistudio/voices/samples/Vindemiatrix.wav","Middle",["Gentle"]],["Sadachbia","https://gstatic.com/aistudio/voices/samples/Sadachbia.wav","Lower",["Lively"]],["Sadaltager","https://gstatic.com/aistudio/voices/samples/Sadaltager.wav","Middle",["Knowledgeable"]],["Sulafat","https://gstatic.com/aistudio/voices/samples/Sulafat.wav","Middle",["Warm"]]],null,null,null,null,null,[8000,24576,0,1],2,null,[18,11]],["models/gemini-2.5-pro-preview-tts",null,"gemini-2.5-pro-preview-tts-2025-05-19","Gemini 2.5 Pro Preview TTS","Gemini 2.5 Pro Preview TTS",8192,16384,["countTokens","generateContent","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,1]]],[[[null,1,20]]]],null,null,null,[["gemini-2.5-pro-preview-tts"]],null,null,null,["gemini-2.5-pro-preview-tts"],"Our 2.5 Pro text-to-speech audio model optimized for powerful, low-latency speech generation for more natural outputs and easier to steer prompts.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[22,37,16,28,23],null,[["Zephyr","https://gstatic.com/aistudio/voices/samples/Zephyr.wav","Higher",["Bright"]],["Puck","https://gstatic.com/aistudio/voices/samples/Puck.wav","Middle",["Upbeat"]],["Charon","https://gstatic.com/aistudio/voices/samples/Charon.wav","Lower",["Informative"]],["Kore","https://gstatic.com/aistudio/voices/samples/Kore.wav","Middle",["Firm"]],["Fenrir","https://gstatic.com/aistudio/voices/samples/Fenrir.wav","Lower middle",["Excitable"]],["Leda","https://gstatic.com/aistudio/voices/samples/Leda.wav","Higher",["Youthful"]],["Orus","https://gstatic.com/aistudio/voices/samples/Orus.wav","Lower middle",["Firm"]],["Aoede","https://gstatic.com/aistudio/voices/samples/Aoede.wav","Middle",["Breezy"]],["Callirrhoe","https://gstatic.com/aistudio/voices/samples/Callirrhoe.wav","Middle",["Easy-going"]],["Autonoe","https://gstatic.com/aistudio/voices/samples/Autonoe.wav","Middle",["Bright"]],["Enceladus","https://gstatic.com/aistudio/voices/samples/Enceladus.wav","Lower",["Breathy"]],["Iapetus","https://gstatic.com/aistudio/voices/samples/Iapetus.wav","Lower middle",["Clear"]],["Umbriel","https://gstatic.com/aistudio/voices/samples/Umbriel.wav","Lower middle",["Easy-going"]],["Algieba","https://gstatic.com/aistudio/voices/samples/Algieba.wav","Lower",["Smooth"]],["Despina","https://gstatic.com/aistudio/voices/samples/Despina.wav","Middle",["Smooth"]],["Erinome","https://gstatic.com/aistudio/voices/samples/Erinome.wav","Middle",["Clear"]],["Algenib","https://gstatic.com/aistudio/voices/samples/Algenib.wav","Lower",["Gravelly"]],["Rasalgethi","https://gstatic.com/aistudio/voices/samples/Rasalgethi.wav","Middle",["Informative"]],["Laomedeia","https://gstatic.com/aistudio/voices/samples/Laomedeia.wav","Higher",["Upbeat"]],["Achernar","https://gstatic.com/aistudio/voices/samples/Achernar.wav","Higher",["Soft"]],["Alnilam","https://gstatic.com/aistudio/voices/samples/Alnilam.wav","Lower middle",["Firm"]],["Schedar","https://gstatic.com/aistudio/voices/samples/Schedar.wav","Lower middle",["Even"]],["Gacrux","https://gstatic.com/aistudio/voices/samples/Gacrux.wav","Middle",["Mature"]],["Pulcherrima","https://gstatic.com/aistudio/voices/samples/Pulcherrima.wav","Middle",["Forward"]],["Achird","https://gstatic.com/aistudio/voices/samples/Achird.wav","Lower middle",["Friendly"]],["Zubenelgenubi","https://gstatic.com/aistudio/voices/samples/Zubenelgenubi.wav","Lower middle",["Casual"]],["Vindemiatrix","https://gstatic.com/aistudio/voices/samples/Vindemiatrix.wav","Middle",["Gentle"]],["Sadachbia","https://gstatic.com/aistudio/voices/samples/Sadachbia.wav","Lower",["Lively"]],["Sadaltager","https://gstatic.com/aistudio/voices/samples/Sadaltager.wav","Middle",["Knowledgeable"]],["Sulafat","https://gstatic.com/aistudio/voices/samples/Sulafat.wav","Middle",["Warm"]]],null,null,null,null,null,2,null,[13,17]],["models/gemini-2.5-flash-preview-tts",null,"gemini-2.5-flash-exp-tts-2025-05-19","Gemini 2.5 Flash Preview TTS","Gemini 2.5 Flash Preview TTS",8192,16384,["countTokens","generateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.5]]],[[[null,1,10,null,"Audio"]]]],null,null,null,[["gemini-2.5-flash-preview-tts"]],null,null,null,["gemini-2.5-flash-preview-tts"],"Our 2.5 Flash text-to-speech audio model optimized for price-performant, low-latency, controllable speech generation.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[22,37,16,28,23],null,[["Zephyr","https://gstatic.com/aistudio/voices/samples/Zephyr.wav","Higher",["Bright"]],["Puck","https://gstatic.com/aistudio/voices/samples/Puck.wav","Middle",["Upbeat"]],["Charon","https://gstatic.com/aistudio/voices/samples/Charon.wav","Lower",["Informative"]],["Kore","https://gstatic.com/aistudio/voices/samples/Kore.wav","Middle",["Firm"]],["Fenrir","https://gstatic.com/aistudio/voices/samples/Fenrir.wav","Lower middle",["Excitable"]],["Leda","https://gstatic.com/aistudio/voices/samples/Leda.wav","Higher",["Youthful"]],["Orus","https://gstatic.com/aistudio/voices/samples/Orus.wav","Lower middle",["Firm"]],["Aoede","https://gstatic.com/aistudio/voices/samples/Aoede.wav","Middle",["Breezy"]],["Callirrhoe","https://gstatic.com/aistudio/voices/samples/Callirrhoe.wav","Middle",["Easy-going"]],["Autonoe","https://gstatic.com/aistudio/voices/samples/Autonoe.wav","Middle",["Bright"]],["Enceladus","https://gstatic.com/aistudio/voices/samples/Enceladus.wav","Lower",["Breathy"]],["Iapetus","https://gstatic.com/aistudio/voices/samples/Iapetus.wav","Lower middle",["Clear"]],["Umbriel","https://gstatic.com/aistudio/voices/samples/Umbriel.wav","Lower middle",["Easy-going"]],["Algieba","https://gstatic.com/aistudio/voices/samples/Algieba.wav","Lower",["Smooth"]],["Despina","https://gstatic.com/aistudio/voices/samples/Despina.wav","Middle",["Smooth"]],["Erinome","https://gstatic.com/aistudio/voices/samples/Erinome.wav","Middle",["Clear"]],["Algenib","https://gstatic.com/aistudio/voices/samples/Algenib.wav","Lower",["Gravelly"]],["Rasalgethi","https://gstatic.com/aistudio/voices/samples/Rasalgethi.wav","Middle",["Informative"]],["Laomedeia","https://gstatic.com/aistudio/voices/samples/Laomedeia.wav","Higher",["Upbeat"]],["Achernar","https://gstatic.com/aistudio/voices/samples/Achernar.wav","Higher",["Soft"]],["Alnilam","https://gstatic.com/aistudio/voices/samples/Alnilam.wav","Lower middle",["Firm"]],["Schedar","https://gstatic.com/aistudio/voices/samples/Schedar.wav","Lower middle",["Even"]],["Gacrux","https://gstatic.com/aistudio/voices/samples/Gacrux.wav","Middle",["Mature"]],["Pulcherrima","https://gstatic.com/aistudio/voices/samples/Pulcherrima.wav","Middle",["Forward"]],["Achird","https://gstatic.com/aistudio/voices/samples/Achird.wav","Lower middle",["Friendly"]],["Zubenelgenubi","https://gstatic.com/aistudio/voices/samples/Zubenelgenubi.wav","Lower middle",["Casual"]],["Vindemiatrix","https://gstatic.com/aistudio/voices/samples/Vindemiatrix.wav","Middle",["Gentle"]],["Sadachbia","https://gstatic.com/aistudio/voices/samples/Sadachbia.wav","Lower",["Lively"]],["Sadaltager","https://gstatic.com/aistudio/voices/samples/Sadaltager.wav","Middle",["Knowledgeable"]],["Sulafat","https://gstatic.com/aistudio/voices/samples/Sulafat.wav","Middle",["Warm"]]],null,null,null,null,null,2,null,[13,17]],["models/imagen-4.0-generate-001",null,"001","Imagen 4","Vertex served Imagen 4.0 model",480,8192,["predict"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[null,[[[null,1,0.04,null,"Image (*Output per image)"]]]],null,null,null,[["imagen-4.0-generate-001"]],null,null,null,["imagen-4.0-generate-001"],"Our latest image generation model, with significantly better text rendering and better overall image quality.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/imagen#imagen-4"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[["models/imagen-4.0-generate-preview-06-06",2],["models/imagen-3.0-generate-002",1]],null,null,null,null,null,null,null,[19],null,null,null,null,[3,2,[1],4,2],null,null,2,null,[15,10],null,null,2],["models/imagen-4.0-ultra-generate-001",null,"001","Imagen 4 Ultra","Vertex served Imagen 4.0 ultra model",480,8192,["predict"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[null,[[[null,1,0.06,null,"Image (*Output per image)"]]]],null,null,null,[["imagen-4.0-ultra-generate-001"]],null,null,null,["imagen-4.0-ultra-generate-001"],"Our latest image generation model, with significantly better text rendering and better overall image quality.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/imagen#imagen-4"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[["models/imagen-4.0-ultra-generate-preview-06-06",2]],null,null,null,null,null,null,null,[19],null,null,null,null,[3,2,[1],4,3],null,null,2,null,[15,10],null,null,2],["models/imagen-4.0-fast-generate-001",null,"001","Imagen 4 Fast","Vertex served Imagen 4.0 Fast model",480,8192,["predict"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[null,[[[null,1,0.02,null,"Image (*Output per image)"]]]],null,null,null,[["imagen-4.0-fast-generate-001"]],null,null,null,["imagen-4.0-fast-generate-001"],"Our latest image generation model, with significantly better text rendering and better overall image quality.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/imagen#imagen-4"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[19],null,null,null,null,[3,2,null,4,2],null,null,2,null,[15],null,null,2],["models/veo-3.1-generate-preview",null,"3.1","Veo 3.1","Veo 3.1",480,8192,["predictLongRunning"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[null,[[[null,1,0.4,null,"Video (*Output per video)"]]]],null,null,null,[["veo-3.1-generate-preview"]],null,null,null,["veo-3.1-generate-preview"],"Our latest video generation model, available to developers on the paid tier of the Gemini API.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/video"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[20],null,null,null,null,null,[3,3,2,2,[3,2],[5,2,4],1,[1,3],2],null,2,null,[14,11],null,null,2],["models/veo-3.1-fast-generate-preview",null,"3.1","Veo 3.1 fast","Veo 3.1 fast",480,8192,["predictLongRunning"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[null,[[[null,1,0.15,null,"Video (*Output per video)"]]]],null,null,null,[["veo-3.1-fast-generate-preview"]],null,null,null,["veo-3.1-fast-generate-preview"],"A faster, more accessible version of Veo 3.1, optimized for speed and business use cases. Available to developers on the paid tier of the Gemini API.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/video"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[20],null,null,null,null,null,[3,3,2,2,[3,2],[5,2,4],1,[1,3],2],null,2,null,[14,11],null,null,2],["models/veo-2.0-generate-001",null,"2.0","Veo 2","Vertex served Veo 2 model. Access to this model requires billing to be enabled on the associated Google Cloud Platform account. Please visit https://console.cloud.google.com/billing to enable it.",480,8192,["predictLongRunning"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[null,[[[null,1,0.35,null,"Video (*Output per video)"]]]],null,null,null,[["veo-2.0-generate-001"]],null,null,null,["veo-2.0-generate-001"],"Our second generation video generation model, available to developers on the paid tier of the Gemini API.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/video#veo-2"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[20],null,null,null,null,null,[3,3,2,2,[3,2],[4,3,2,1],2,[1],1],null,2,null,[14],null,null,2]]]
```

## ListPrompts

```bash
curl 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/ListPrompts' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'X-Goog-Api-Key: AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs' \
  -H 'X-Goog-AuthUser: 0' \
  -H 'Authorization: SAPISIDHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID1PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID3PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78' \
  -H 'Content-Type: application/json+protobuf' \
  -H 'X-User-Agent: grpc-web-javascript/0.1' \
  -H 'Origin: https://aistudio.google.com' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzVcHDJSzQPjyOvsAwarm71IuQKbduqv3QdlmzPdGvGVRPEEmlCpTrAdxngPu3l-t_Y2HQ; __Secure-1PSIDCC=AKEyXzXmRjFZJy7OdhDJAozskcDsKXOYBhrCNiYejD5aTa4Lc88W0Cf9VAcYUlHLX-f1BFhW; __Secure-3PSIDCC=AKEyXzUgLODYGlUKK-dyVJI0b3mHyOQjh8bkCRRvMuUK6dZ2Z8GbNQvEtTExhxpPcCXvzR-Obg; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  --data-raw '[100]'
```

Response:
```http
HTTP/3 200 
content-type: application/json+protobuf; charset=UTF-8
strict-transport-security: max-age=10886400; includeSubdomains
vary: Origin
vary: X-Origin
vary: Referer
content-encoding: gzip
date: Sat, 14 Feb 2026 18:19:52 GMT
server: ESF
content-length: 6281
x-xss-protection: 0
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
access-control-allow-origin: https://aistudio.google.com
access-control-allow-credentials: true
access-control-expose-headers: vary,vary,vary,content-encoding,date,server,content-length
server-timing: gfet4t7; dur=502
set-cookie: SIDCC=AKEyXzUyw5aRGl09klqHY0TWJVKJr_caGjqjyl82v6cjCNQNxb-ik2NhN1YNTtlDMA9nkFcr_Q; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; priority=high
set-cookie: __Secure-1PSIDCC=AKEyXzWIWpuiwANPPJhV2yQ4rccIfiPWJzyBcrHmSgHsIzb6738-67LYiC8p3z8BH7eCEvVt; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high
set-cookie: __Secure-3PSIDCC=AKEyXzViWLnjSMFIpCyk7dEEUP8jodPVtL5SRaE8tNBeYsfo_WX89pdt9-5j4V7IQ0k3w9WHOQ; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high; SameSite=none
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
expires: Sat, 14 Feb 2026 18:19:52 GMT
cache-control: private

[[["prompts/1ZUhF9ioNt-hMU9bwNoh7KgsloVDhZOUg",null,null,null,["Greeting and Offer of Assistance.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1771090804",370000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1kU8ADYoJmyIEojRkOScDPp8iZYUZ3gIE",null,null,null,["Приветствие и помощь",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1771013436",423000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1SQfkCvmwiGd7Ed30ejYgcf33oRwNg50P",null,null,null,["Hello, How Can I Help?",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1771013436",423000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/19_sXbM-sRckgI6eiAz48LRMwO2WnEEvg",null,null,null,["MakerSuite Service Definitions",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1771013436",422000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1vOokAJuLYuw5xEn3zcgjMUqkQW5Hfv_s",null,null,null,["Isolating Function Dependencies.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770833974",729000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/11jPwUvGmaxtZ7ATOA37yyICPrkGBoSqK",null,null,null,["Copy of Branch of Copy of Copy of Copy of Copy of Proxy Implementation Fixes Needed.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770659458",149000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1dC1a9Z0XRuaFsxrM5MyiNqkFyLlYLGyA",null,null,null,["What does GTR mean?",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770520245",709000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1hv__xPmSbBW1jAivK6S0sYPXODf7aA3m",null,null,null,["Google API Client Library Utilities.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770520245",709000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1jXNOqLSimD75XB3luur1ABSgc9XGmS8_",null,null,null,["Windows Curl Command Examples",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770520245",709000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1UGmvTDfhJ1mfmBqsI_8BTBhAVem4v4sD",null,null,null,["Greeting and Assistance Offered",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770520245",708000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/13cxYm04kIeACSXkKoSC9VWIX8X6g99LS",null,null,null,["Excited Celebration, How Can I Help?",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770520245",707000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1vz7fz528RrOWy8E0BoSX4EO7Ij2MTBzB",null,null,null,["Project Switch Bug Fixes",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770385805",793000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1FITOUYJlQhwP3G_0oweKpb-fp1wFCm5e",null,null,null,["Greeting and Offer of Help",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770385805",792000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/183k5RRRYWzpXR9vc6jg4q71C3uop3Q18",null,null,null,["Copy of Branch of Copy of Copy of IDE: HTML, CSS, VUE #12",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770385805",792000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/14Cl2dd96ymHEINtqsLIqe43q50F-ydrD",null,null,null,["How Can I Help You?",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770385805",792000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1hoW--Ygtyx7-J0JVZ4dwqmz1Rn4VO3ej",null,null,null,["Copy of IDE: HTML, CSS, VUE",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770083821",301000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1Ty9KPGzg4wWU-VEOlYv2YAehy9wYuq5u",null,null,null,["Copy of Copy of Copy of IDE: HTML, CSS, Tailwind Fixes",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769996356",360000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1G00WO98cylfoB5bu-YyNA03CL-DdynIv",null,null,null,["Copy of Fixing Monaco's Fixed Widgets.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769982840",626000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1oa2V3mr9it7PQvraXEgsZD-MnQAhz1LU",null,null,null,["Monaco Editor Widget Styling Fix #2",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769870469",476000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1ZUuCZz7ES3xS8du7-_Gc8VA_6WKc46tM",null,null,null,["Ліки 2026 для літніх",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769870179",107000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1xQCc0lxYFGNNqmadVRvQzRPCAfUjZIE0",null,null,null,["Post VueSFC №16",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769738871",547000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1h4YfMxASccnbCu6pZ3VaWvdc9fXRAb85",null,null,null,["Зображення статті про вимкнення світла",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769738871",547000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1BY6o7-CzbUu9mdHiC0vKf9TDW8y25sd7",null,null,null,["Branch of Post VueSFC №12",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769543942",685000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1QAM0Ss8NlYXRzY1pQm4Wr5iBB79cKLeg",null,null,null,["Post VueSFC №12",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769543942",685000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1g1ClvLmq1x8RhhyhaIgi_ORYqS4osUz1",null,null,null,["Post VueSFC №11",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769445991",712000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1BF-HJgnDtnwSo8UDJmv6QAF0VEo3LIuT",null,null,null,["Branch of Post VueSFC №6",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769274375",244000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1VxykdLUD-KpgFtqxzbqDIc_CkdHxTRpw",null,null,null,["Post VueSFC №6",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769263859",293000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/173OlTsNKelcI1Xuql5EbhBRyZivmT0K3",null,null,null,["Replace Session Generator With Docker",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769210345",373000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1PngGf9C992by239xHmSjzvgf7Ab_oW-h",null,null,null,["Copy of Branch of Branch of Post VueSFC №4",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769045933",827000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1Dzobmg4YKQxgUikrgWhc_Sndgr1O5UcT",null,null,null,["Branch of Copy of Branch of Branch of Post VueSFC №4",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769045933",827000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1yQAhW5WgWM3H8PcBRm1U-p2HWLDFJR_B",null,null,null,["Post VueSFC",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768588662",368000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1l5Kj-NlmlF5Mqi1hpnXugzLyKyBrQXtq",null,null,null,["Replace Console Logs with TSLog",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768588662",368000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1tE3PQkuZZsxO-gkRU0rpvDkhq44eHiH-",null,null,null,["Copy of Copy of Copy of Branch of Copy of Yjs Collab",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768519923",356000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1j19Hrg74vdzhUJ_x0_je5tCFvCS7OEju",null,null,null,["Webpack Bundled React Application Breakdown",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768492376",875000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1ydD7WZ3S5WvaQabe6Q_bAPYQn13CeW1H",null,null,null,["Branch of Copy of Branch of Copy of Copy of Branch of Copy of Monaco Vue SFC Support",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768343532",676000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1o3XHQbgidR_Z5kKOs01q52et46FP_SWu",null,null,null,["Copy of Branch of Copy of Copy of Branch of Copy of Monaco Vue SFC Support",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768342419",520000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/191lm2j0oqe7YF6--VXYmnhZCXDOjBO5c",null,null,null,["Copy of Copy of Vue Support Research",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768160124",861000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/15aFPmZ2EiiZLIoBS6Vmymhkq-h9S4Fpl",null,null,null,["Monaco Vue SFC Support",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768160124",861000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1ZXZBtCxSEBnFoCHWp_Wz0uHrWqQmZqRs",null,null,null,["Branch of Copy of Copy of Copy of Branch of Copy of Yjs Collab",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767829462",247000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1bfNu8BYj_e03z0k43GTSxhmJ73hJ4GE3",null,null,null,["Branch of Branch of Copy of Copy of Copy of Branch of Copy of Yjs Collab",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767829462",247000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1uUAZK_9Nj7GRpRH6GHjL3WqJ9syzv4Cv",null,null,null,["Yjs Collab",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767393392",135000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/15mX_66138xQYDkKMG-XviGljQkond7k9",null,null,null,["Lightning-FS & Isomorphic-Git #5",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767148437",997000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1gjYPnHG5NNSbyi9gUt1Ej37B40JjWjA5",null,null,null,["Lightning-FS & Isomorphic-Git #4",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767148437",997000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/10_mcdWcc4KvNlzQZbDgOGJUreyzR2jmD",null,null,null,["Різдвяний Фон Для Поздоровлень",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767148437",997000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1cSCJENgkJVBIgQwIaG9meYC4WDCKsn9i",null,null,null,["Lightning-FS & Isomorphic-Git #1",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766943352",560000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1xoRSXxSEAwiOjTgZpWOP3GIWrS-wVVuP",null,null,null,["OPFS & ORAMA #4",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766941555",380000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1gGUJzUbDhr-pYTF6calZzqTLQafZP2U9",null,null,null,["OPFS & ORAMA #3",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766798450",13000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1E9AfzaFG_dZH8g62XXqdTNjAktWjqV4T",null,null,null,["Branch of Branch of Branch of Branch of Branch of Copy of Copy of Branch of Branch of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766798450",12000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1zuGSmG_GG1SQ390zL0OqpjP8ITU5CsnD",null,null,null,["Branch of Branch of Branch of Branch of Branch of Branch of Branch of Copy of Copy of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766450951",200000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1RY-ymvfUNkGL0IiVMw42H3oUrWsNoIB-",null,null,null,["Branch of Branch of Branch of Branch of Branch of Branch of Copy of Copy of Branch of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766431860",718000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1S34DoHdde1L6WgEk_gb8OwjI7DNL2Rv7",null,null,null,["Branch of Branch of Branch of Branch of Copy of Copy of Branch of Branch of Branch of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766184482",447000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/12wsbWA-le-255NQ2lwZ-PyEOFvmn7XTX",null,null,null,["Branch of Branch of Branch of Copy of Copy of Branch of Branch of Branch of Branch of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766091441",343000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1Vc51CAiEv184jAu64eDbJB4aNzKv1kTZ",null,null,null,["Branch of Branch of Copy of Copy of Branch of Branch of Branch of Branch of Branch of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766019968",778000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1vrPlMfoPLeriFTJ04Ga86_agWvdiYZpr",null,null,null,["Branch of Copy of Copy of Branch of Branch of Branch of Branch of Branch of Branch of Branch of Copy",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765814173",556000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1SrFKJeE1L2BruNRAOqaQIFnEO-IOFK0c",null,null,null,["Copy of Copy of Branch of Branch of Branch of Branch of Branch of Branch of Branch of Copy of Branch",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765635595",712000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1VdKT4hhWjmrC85OkcW5WPLzA4WMK7RdP",null,null,null,["Copy of Branch of Branch of Branch of Branch of Branch of Branch of Branch of Copy of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765635403",402000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1qIMt3Bef8N78YtFVqIHURO3HjWSk52CR",null,null,null,["Branch of Branch of Branch of Branch of Branch of Branch of Branch of Copy of Branch of Branch of Br",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765581989",563000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1IIhM6nCRhUko1D9hHBoGXkR6LafU3HCO",null,null,null,["Зміни стать персонажа",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765581715",981000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1SuFne3FlD7Tr36z2VQJCJ8JcsgApEOE7",null,null,null,["Branch of Branch of Branch of Branch of Branch of Branch of Copy of Branch of Branch of Branch of Vu",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765577341",291000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1wcZ3_SM4q-dHGzrNHQeyrNplA8LuXXrd",null,null,null,["Branch of Branch of Branch of Branch of Branch of Copy of Branch of Branch of Branch of Vue 3 Electr",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765403560",265000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/11cfpNusa3T3MtMvDbSZ-4RxLY-_64WOi",null,null,null,["Branch of Branch of Branch of Branch of Copy of Branch of Branch of Branch of Vue 3 Electron Card De",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765315304",245000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1JYSka8NZQKZRowioRa0IpKCxLcjbbRtr",null,null,null,["Branch of Branch of Branch of Copy of Branch of Branch of Branch of Vue 3 Electron Card Deck Builder",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765211589",967000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1rL2PW4A40WsuMvgFUoyn7S31cBgga7cy",null,null,null,["Branch of Branch of Branch of Branch of Copy of Branch of Branch of Branch of Vue 3 Electron Card De",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765210900",469000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1a4V95_mQpI8harYpMQrV7XI6s4rJaTqL",null,null,null,["IBC Deck Builder Project Files",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765161906",225000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1RWX4224oNyPCZEPE8AtQSVjCabwmdgOZ",null,null,null,["Branch of Branch of Copy of Branch of Branch of Branch of Vue 3 Electron Card Deck Builder",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764895338",266000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/13PZtWzP05Kd_-XYK4v1TVB9IJDo_3IJg",null,null,null,["Branch of Copy of Branch of Branch of Branch of Vue 3 Electron Card Deck Builder",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764884146",271000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/11J29zeYjppWUCB8IHY1T1__TYNssML51",null,null,null,["Copy of Branch of Branch of Branch of Vue 3 Electron Card Deck Builder",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764884077",704000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1kQCcNSnoiybksoj0OPek9ruBlYyha8Ze",null,null,null,["High-Quality Image Creation",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764850716",211000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1DCkIibe5MH4DymDToAy4wJqUfynAZlko",null,null,null,["Hello, How Can I Help?",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764808702",191000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1QT4R-ndluuAzuG27p646ld-WaLhbmaTi",null,null,null,["Copy of Branch of Branch of Branch of Vue 3 Electron Card Deck Builder",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764808669",917000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1yUZu4gRCLbf109j6sp69Qv8qlIrvw4Z3",null,null,null,["Інтриг Великого Міста 2.5",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764618871",676000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1V1Adu3vTZwlT0-R1MDAIL8rmpzKdxTdV",null,null,null,["Інтриги Великого Міста 3.0",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764618858",189000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1zGbp2kvTySjCVxSWFv5Zfv8RRftQRpwc",null,null,null,["Game Card Template Markup",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764595150",985000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/18FfcfzjEFigh7lOH-Bt7-GivVZhogYiV",null,null,null,["Card Styling",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764547773",568000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/12j-CVMkxNt-v9qtnrOA1J9wcHtsVBjNw",null,null,null,["Правила Гри: Інтриги Великого Міста",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764461391",532000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1z8YObA8ZlNdDLYBefG2lRnNjRZkYR2bE",null,null,null,["Texture Request: Solid Gold",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764458013",212000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1VTcaM4FnFBIsiS9gxDlbd2RMnkSM1Jtg",null,null,null,["Icon Race Map Suggestion",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764453124",630000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1m9759RQYoamKE4Dg9tHVp1FekDhgMTS7",null,null,null,["Steam Avatar for Dota 2 Player",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764427733",318000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1HPqDx0o-uqiHgxXVLF_WeUi3JTTfSkVY",null,null,null,["Дизайн карточки для фоновых изображений",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764374236",631000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1EMUyokgg0ihQPeOUnRxtKJ72WSEuvVTT",null,null,null,["Офіційне Магічне Посвідчення Громадянина",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764265512",522000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1YFcV_0llK1UETwz3mDb8OqB32F18ZctV",null,null,null,["Branch of Зображення Монстрів Двері №2",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764265322",58000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1Dd-eHyc9rW8V0crpiGS_tML56jT3MlOY",null,null,null,["Дизайн Першої Сторінки Книги Правил",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764264198",70000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/17BLyMxt-WFAjR8rlq2pJd2AEndq3xsxr",null,null,null,["Зображення Монстрів Двері №2",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764174849",476000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1mhaCoh22-QzwFFOiQXQ0Phlj0jC5STDC",null,null,null,["Зображення Монстрів Двері №1",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764106051",248000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1qZqDbj9UPtXiq_BW4Tz_4JJFr3B_GX2e",null,null,null,["The Binding of Isaac: Untermenschen",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764071292",252000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1u7Pj-apYu7DkuC7uNIG8BiGbwHdT9crD",null,null,null,["Зображення Спорядження Скарбів №2",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764021537",615000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1bdOnuWPF4DBKACrehYajzTJgE3KyBvXU",null,null,null,["Зображення Спорядження Скарбів",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763943365",733000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1ivU4pSFNTG9c-gu401DGTtgzXeiGPWnn",null,null,null,["Зображення Одноразових Скарбів",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763842701",78000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1BBR5mpbfBTaFRlJbJipmpdMsK6rvj5ym",null,null,null,["Зображення Спеціальних Скарбів",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763810651",479000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1uxgnbxceqM1JTscAkM736Z87cap7uNQ0",null,null,null,["Branch of Branch of Branch of Branch of Людина: Авантюрист біля таверни.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763759507",812000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1mywkq0k7Z0J3mVfyABSSmqHo366K7-mW",null,null,null,["Branch of Branch of Branch of Людина: Авантюрист біля таверни.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763682878",215000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1fHxq0ViQ24qNKjwRcN01jtr538sswKNr",null,null,null,["Напіврослика Як Приманка",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763682739",550000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1FXe_sDSfZf0NjoQJQJxt0IAgpeQODTXS",null,null,null,["Branch of Branch of Людина: Авантюрист біля таверни.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763510476",491000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1IpbNKC1cHBpwoL7HVpl2jlds9ItDde-t",null,null,null,["Branch of Людина: Авантюрист біля таверни.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763500845",876000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/13wHdCfHrQ-MXsT4mLCZFDKOs89xrC1Gv",null,null,null,["Інтриги Великого Міста",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763423168",146000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1G8tqpzephbuna00-A29oc5a-_CEpvvtz",null,null,null,["Людина: Авантюрист біля таверни.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763329429",109000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1PrEB7DKrXQYK_SwGFWJvBinLz2goDJa_",null,null,null,["Fantasy Portrait Of An Adventurer",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763302986",702000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1QBwdpLlEQtOLKlRzRDyQHPB8D_Ndl8qf",null,null,null,["Карта, монети, жінка-авантюристка.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763159975",839000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1o_NefpswLuKz_GUz8ILYQuqLlZxx31_Y",null,null,null,["Іржава відмичка у схованці гільдії",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763129894",611000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1-56DHjWuhAuSmdBWPE2JJwFMVt46kl6x",null,null,null,["Сковорода з рунами у монастирі.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763051748",730000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]]],"~!!~AI9FV7Q07uPqVU3tXLOdy6IRtYmjkLd1KUl9A7s4L7FnBjxLaHwlU48R9fypnYz5Wun4JIe836ESCT5okw2sdQ3LCyHGrSJaewUKvxKdfbnLLTnCuFSt1gDjNRjLl4Y8cFSRlNd_vVklAFdHrDtHH6Pn9fuztXYwTWLI3E8DKkHAN1Qg4Bu4dxmbf7nQIupkj0kjcgz7xFPtzp08bDlmsMjjjetnGBifHLktBXGMmqTRmz_TCc9c_DC87_G3ILvlidWeM3k-6yufkv6aJmb78auUar1l8Ehdc5a68YfPcHmAcLBVExxQtDb6QgLGNNVGTOgF7cBy50iA"]
```

## ListCodeAssistantConfigurations

```bash
curl 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/ListCodeAssistantConfigurations' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'X-Goog-Api-Key: AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs' \
  -H 'X-Goog-AuthUser: 0' \
  -H 'Authorization: SAPISIDHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID1PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID3PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78' \
  -H 'Content-Type: application/json+protobuf' \
  -H 'X-User-Agent: grpc-web-javascript/0.1' \
  -H 'Origin: https://aistudio.google.com' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzVcHDJSzQPjyOvsAwarm71IuQKbduqv3QdlmzPdGvGVRPEEmlCpTrAdxngPu3l-t_Y2HQ; __Secure-1PSIDCC=AKEyXzXmRjFZJy7OdhDJAozskcDsKXOYBhrCNiYejD5aTa4Lc88W0Cf9VAcYUlHLX-f1BFhW; __Secure-3PSIDCC=AKEyXzUgLODYGlUKK-dyVJI0b3mHyOQjh8bkCRRvMuUK6dZ2Z8GbNQvEtTExhxpPcCXvzR-Obg; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  -H 'TE: trailers' \
  --data-raw '[]'
```

Response:
```http
HTTP/3 200 
content-type: application/json+protobuf; charset=UTF-8
strict-transport-security: max-age=10886400; includeSubdomains
vary: Origin
vary: X-Origin
vary: Referer
content-encoding: gzip
date: Sat, 14 Feb 2026 18:19:52 GMT
server: ESF
content-length: 484
x-xss-protection: 0
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
access-control-allow-origin: https://aistudio.google.com
access-control-allow-credentials: true
access-control-expose-headers: vary,vary,vary,content-encoding,date,server,content-length
server-timing: gfet4t7; dur=42
set-cookie: SIDCC=AKEyXzUih4YzZeTNbR6wHcucTPVkZ-MDoa_LQHzEPMhZylJ4N1MDB-DpnB0wRdgPwimJRG0clQ; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; priority=high
set-cookie: __Secure-1PSIDCC=AKEyXzWLTosYdTILfPFihcIicnIFOChpmYH2WKy8zHW6ghcYg58BKy0b93hu3jdNSZvrPh-D; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high
set-cookie: __Secure-3PSIDCC=AKEyXzWKNJZGLmY0Bfyrffsrt8_2CUgdXSNe7Qs07yj67HkmsYCucHVVraAfaq5JHjkHbm6ZOw; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high; SameSite=none
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
expires: Sat, 14 Feb 2026 18:19:52 GMT
cache-control: private

[[["angular",[null,null,null,["Angular (TypeScript)","The configuration is for working with Angular + TypeScript application. The Code Assistant is instructed to work with Angular components, services, and modules. It follows strict guidelines for using the Gemini API.",3]]],["default",[null,null,null,["React (TypeScript)","The configuration is for working with React + TypeScript application. Assumes a basic structure with index.html and index.tsx. Code Assistant follows strict guidelines for using the Gemini API.",1]]]],[["complete",["Complete","Production-ready. Full verification, completeness checklist."]],["default",["Default","Default configuration."]],["lintonly",["Lint Only","Always lint, no compile. Faster verification."]],["retry1",["Retry 1","Max 1 retry. Escalate quickly on errors."]],["retry5",["Retry 5","Max 5 retries. More attempts before escalating."]],["shadcn",["Shadcn","Next.js with Shadcn UI."]],["speed",["Speed","Fast iteration. No compile, lint on suspicion, max 1 retry."]]]]
```

## Fetch JS, AntiBot or Fingerprinting

```bash
curl 'https://www.google.com/js/bg/NXqNxYXDnP8COlhZowsibgFDkJn-5zQovc7J2vyTyLo.js' \
  --compressed \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzXgVGUSDC4Krpl7Ca57qBWJDVoh5GkADgrC7JdrUv7idL8SiskpMY5N8D3uFeyINppo9g; __Secure-1PSIDCC=AKEyXzUp6ZQMcvE1mM07XBY2gNxJXL0btpSubp_je-_f2SHPUyxLZcn1UflvCcQihmk5A751; __Secure-3PSIDCC=AKEyXzWZYGY2LRtdbdgy3GDMQk9ylnmiHtQQeOhk0tv2NcNjTGllKIfI8bqygXVh1jDpXUWZ3w; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Sec-Fetch-Dest: script' \
  -H 'Sec-Fetch-Mode: no-cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache'
```

Response:
```http
HTTP/3 200 
accept-ranges: bytes
content-encoding: br
content-security-policy-report-only: require-trusted-types-for 'script'; report-uri https://csp.withgoogle.com/csp/botguard-scs
cross-origin-resource-policy: cross-origin
cross-origin-opener-policy: same-origin; report-to="botguard-scs"
report-to: {"group":"botguard-scs","max_age":2592000,"endpoints":[{"url":"https://csp.withgoogle.com/csp/report-to/botguard-scs"}]}
content-length: 23411
x-content-type-options: nosniff
server: sffe
x-xss-protection: 0
date: Sat, 14 Feb 2026 07:28:58 GMT
expires: Sun, 14 Feb 2027 07:28:58 GMT
cache-control: public, max-age=31536000
last-modified: Mon, 02 Feb 2026 17:30:00 GMT
content-type: text/javascript
vary: Accept-Encoding
age: 39054
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000

// I removed content of the script as it is not relevant to the trace and is quite large.
```

## People API batch request

```bash
curl 'https://people-pa.clients6.google.com/batch?%24ct=multipart%2Fmixed%3B%20boundary%3Dbatch850679775828512945' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'Content-Type: text/plain; charset=UTF-8' \
  -H 'Origin: https://aistudio.google.com' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzUI6fPPVzTw8e6mjjcRAgETDl2lCTteFAG_m1XcS3ffd8s6LgCPI3xEewX60AfEaVszmg; __Secure-1PSIDCC=AKEyXzWMcBzPHMVxPoOYNOLw9At3GEAamnkOaWMmjlsb33n47VRCI2sBoCmGZ4v0rdceIrq3; __Secure-3PSIDCC=AKEyXzUkcetXeoGlPayvSURKldaETIw0QXmZJABiSy_GaLtEau8VcJnHkb2wnSXVOwYoNOmsjw; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  -H 'TE: trailers' \
  --data-raw ''
```

Response:
```http
HTTP/3 200 
content-length: 776
content-type: multipart/mixed; boundary=batch__1TIm5rr243ZkDv-BPwBgyubUvES8ZDU
strict-transport-security: max-age=10886400; includeSubdomains
vary: Origin
vary: X-Origin
vary: Referer
content-encoding: gzip
date: Sat, 14 Feb 2026 18:19:52 GMT
server: ESF
x-xss-protection: 0
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
access-control-allow-origin: https://aistudio.google.com
access-control-allow-credentials: true
access-control-expose-headers: content-length,vary,vary,vary,content-encoding,date,server
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000


--batch__1TIm5rr243ZkDv-BPwBgyubUvES8ZDU
Content-Type: application/http
Content-ID: <response-batch850679775828512945+gapiRequest@googleapis.com>

HTTP/1.1 200 OK
Content-Type: application/json; charset=UTF-8
Vary: Origin
Vary: X-Origin
Vary: Referer

{
  "personResponse": [
    {
      "personId": "me",
      "status": "SUCCESS",
      "person": {
        "personId": "110454369048732362932",
        "metadata": {
          "identityInfo": {
            "originalLookupToken": [
              "me"
            ]
          }
        },
        "name": [
          {
            "metadata": {
              "writeable": true,
              "container": "PROFILE",
              "primary": true,
              "encodedContainerId": "110454369048732362932",
              "containerPrimary": true,
              "containerType": "PROFILE"
            },
            "displayName": "Some One",
            "givenName": "Some",
            "familyName": "One",
            "displayNameLastFirst": "One, Some",
            "unstructuredName": "Some One"
          }
        ],
        "photo": [
          {
            "metadata": {
              "writeable": true,
              "container": "PROFILE",
              "primary": true,
              "visibility": "PUBLIC",
              "encodedContainerId": "110454369048732362932",
              "containerType": "PROFILE"
            },
            "url": "https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w",
            "photoToken": "EhUxMTA0NTQzNjkwNDg3MzIzNjI5MzIoATC-kv2NBw=="
          }
        ],
        "email": [
          {
            "metadata": {
              "container": "ACCOUNT",
              "primary": true,
              "encodedContainerId": "110454369048732362932",
              "containerPrimary": true,
              "containerType": "ACCOUNT"
            },
            "value": "demkom58@gmail.com",
            "classification": "SIGNUP_EMAIL",
            "signupEmailMetadata": {
              "primary": true
            }
          }
        ],
        "fingerprint": "%EgMCAwkaAwEFBw=="
      },
      "responseStatus": {}
    }
  ]
}

--batch__1TIm5rr243ZkDv-BPwBgyubUvES8ZDU--
```

## ResolveDriveResource

```bash
curl 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/ResolveDriveResource' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'X-Goog-Api-Key: AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs' \
  -H 'X-Goog-AuthUser: 0' \
  -H 'Authorization: SAPISIDHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID1PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID3PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78' \
  -H 'Content-Type: application/json+protobuf' \
  -H 'X-User-Agent: grpc-web-javascript/0.1' \
  -H 'Origin: https://aistudio.google.com' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzWv6jmD8T_rXOQCVBviI9V-v1yZyqCA4qhCMXLGRR7gryn5lm-dxWsAszwekwBqHooB_g; __Secure-1PSIDCC=AKEyXzVjlKCfS4UlcltXcQFJ9EqZYbaf0It2-OfRFvD7gypzQmDTn4ltLtWFZfM5pRH8weyB; __Secure-3PSIDCC=AKEyXzX9UZMCE7mrAB9YB0aoFn2l3ogpJ6wPOTGYvfzo5GPVZglTyiB5i2zr7LUlhyMnTlsNtw; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  -H 'TE: trailers' \
  --data-raw '["1ZUhF9ioNt-hMU9bwNoh7KgsloVDhZOUg"]'
```

Response:
```http
HTTP/3 200 
content-type: application/json+protobuf; charset=UTF-8
strict-transport-security: max-age=10886400; includeSubdomains
vary: Origin
vary: X-Origin
vary: Referer
content-encoding: gzip
date: Sat, 14 Feb 2026 18:19:52 GMT
server: ESF
content-length: 937
x-xss-protection: 0
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
access-control-allow-origin: https://aistudio.google.com
access-control-allow-credentials: true
access-control-expose-headers: vary,vary,vary,content-encoding,date,server,content-length
server-timing: gfet4t7; dur=597
set-cookie: SIDCC=AKEyXzV_E3kDjhjo6tezrsJ6jTAOp9LM-ybdpoot4IDa0DUMGAFMBPoO1qyKPFpv_1uMDkR3MQ; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; priority=high
set-cookie: __Secure-1PSIDCC=AKEyXzVai3c9dsqZhgPT8CWPM2ztqhCshFpzv7LDjFM2JhKVqoUmxrxzVwippvL48HKrXbfr; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high
set-cookie: __Secure-3PSIDCC=AKEyXzURUSwDYT9c-stIvhgcgEe0QLNyeY5WFtfS9tQKeJGCY-ae5gEgw298P_NwBIqY4IKQ4w; expires=Sun, 14-Feb-2027 18:19:52 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high; SameSite=none
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
expires: Sat, 14 Feb 2026 18:19:52 GMT
cache-control: private

[["prompts/1ZUhF9ioNt-hMU9bwNoh7KgsloVDhZOUg",null,null,[1,null,"models/gemini-3-flash-preview",null,0.95,64,65536,[[null,null,7,5],[null,null,8,5],[null,null,9,5],[null,null,10,5]],null,0,null,null,null,null,1,null,null,0,0,null,null,null,null,null,-1,[],null,"1K",3],["Greeting and Offer of Assistance.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1771090804",370000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,[],[[["Hi!",null,null,null,null,null,null,null,"user",null,null,null,null,null,null,null,null,null,3,null,null,null,null,null,null,null,null,null,"",null,0,0],["Hello! How can I help you today?",null,null,null,null,null,null,null,"model",null,null,null,null,null,null,null,1,null,9,null,null,null,null,null,null,null,null,null,"",[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],0,0]],[["",null,null,null,null,null,null,null,"user",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"",null,0,0]]]]]
```

## ListRecentApplets

```bash
curl 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/ListRecentApplets' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'X-Goog-Api-Key: AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs' \
  -H 'X-Goog-AuthUser: 0' \
  -H 'Authorization: SAPISIDHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID1PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID3PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78' \
  -H 'Content-Type: application/json+protobuf' \
  -H 'X-User-Agent: grpc-web-javascript/0.1' \
  -H 'Origin: https://aistudio.google.com' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzXZK2gvL70qY4SC-HRCZO0wjMHfene6cxQqDnSAbG1kcvxTUg8p2bayACnoc0W0RWg1uQ; __Secure-1PSIDCC=AKEyXzXZszzxrotsWd0vlkk55OsJ5IpI3RlXybxplQd4Ds1gGEWaozCOJEdmWdU4UCx2PA0Z; __Secure-3PSIDCC=AKEyXzWn-8rAnDZy2ojULB88QVCUR161T6wjNCmzctPvrDDfgDiaseNkG75m8PSFv_RiTM6d0g; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  -H 'TE: trailers' \
  --data-raw '[]'
```

Response:
```http
HTTP/3 200 
content-type: application/json+protobuf; charset=UTF-8
strict-transport-security: max-age=10886400; includeSubdomains
vary: Origin
vary: X-Origin
vary: Referer
content-encoding: gzip
date: Sat, 14 Feb 2026 18:19:53 GMT
server: ESF
content-length: 24
x-xss-protection: 0
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
access-control-allow-origin: https://aistudio.google.com
access-control-allow-credentials: true
access-control-expose-headers: vary,vary,vary,content-encoding,date,server,content-length
server-timing: gfet4t7; dur=1581
set-cookie: SIDCC=AKEyXzU_33Mo-NXn-Yml9AsHml3OBMLG6YDoDnNCSjL0bWWnc58iYmKV259VHsn48dq4B-vxZw; expires=Sun, 14-Feb-2027 18:19:53 GMT; path=/; domain=.google.com; priority=high
set-cookie: __Secure-1PSIDCC=AKEyXzXY8IFxyF4sjUdkH737fhfxG8bHy0qA2uNcbnMBSqATVMDhd53VmXjbB16zgz2rMczS; expires=Sun, 14-Feb-2027 18:19:53 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high
set-cookie: __Secure-3PSIDCC=AKEyXzXF3PHkv2dvLp93n5cROaHiL3A3NWVYf8lB1o_HHWkts123RsxwRyifQ7USufV8whLXyw; expires=Sun, 14-Feb-2027 18:19:53 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high; SameSite=none
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
expires: Sat, 14 Feb 2026 18:19:53 GMT
cache-control: private

[[]]
```

## ListPrompts

```bash
curl 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/ListPrompts' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'X-Goog-Api-Key: AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs' \
  -H 'X-Goog-AuthUser: 0' \
  -H 'Authorization: SAPISIDHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID1PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78 SAPISID3PHASH 1771093191_1b14b75d09f8bc6fd2246ab6c2f7332d17c06c78' \
  -H 'Content-Type: application/json+protobuf' \
  -H 'X-User-Agent: grpc-web-javascript/0.1' \
  -H 'Origin: https://aistudio.google.com' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzXZK2gvL70qY4SC-HRCZO0wjMHfene6cxQqDnSAbG1kcvxTUg8p2bayACnoc0W0RWg1uQ; __Secure-1PSIDCC=AKEyXzXZszzxrotsWd0vlkk55OsJ5IpI3RlXybxplQd4Ds1gGEWaozCOJEdmWdU4UCx2PA0Z; __Secure-3PSIDCC=AKEyXzWn-8rAnDZy2ojULB88QVCUR161T6wjNCmzctPvrDDfgDiaseNkG75m8PSFv_RiTM6d0g; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  -H 'TE: trailers' \
  --data-raw '[100]'
```

Response:
```http
HTTP/3 200 
content-type: application/json+protobuf; charset=UTF-8
strict-transport-security: max-age=10886400; includeSubdomains
vary: Origin
vary: X-Origin
vary: Referer
content-encoding: gzip
date: Sat, 14 Feb 2026 18:19:53 GMT
server: ESF
content-length: 6278
x-xss-protection: 0
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
access-control-allow-origin: https://aistudio.google.com
access-control-allow-credentials: true
access-control-expose-headers: vary,vary,vary,content-encoding,date,server,content-length
server-timing: gfet4t7; dur=1285
set-cookie: SIDCC=AKEyXzVkIfF-qjjfA_1KoKrS11-89DOawJMPYHtGG8R7pFq-kV-0QywpVL1MgZOscF2KAEn7ng; expires=Sun, 14-Feb-2027 18:19:53 GMT; path=/; domain=.google.com; priority=high
set-cookie: __Secure-1PSIDCC=AKEyXzWvb_6MAuMpOq_4hpd_tv74XwDoi5S8u3J1_y-kc-2NFj6qixTrmVEILSYBlIfGHqPc; expires=Sun, 14-Feb-2027 18:19:53 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high
set-cookie: __Secure-3PSIDCC=AKEyXzV7RXGJaQcFtblSkLSvzWEPLPth4YwyW0SBkKetzanFfn4ZBfy4k9FF1B8vD0Wj_p7sPQ; expires=Sun, 14-Feb-2027 18:19:53 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high; SameSite=none
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
expires: Sat, 14 Feb 2026 18:19:53 GMT
cache-control: private

[[["prompts/1ZUhF9ioNt-hMU9bwNoh7KgsloVDhZOUg",null,null,null,["Greeting and Offer of Assistance.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1771090804",370000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1kU8ADYoJmyIEojRkOScDPp8iZYUZ3gIE",null,null,null,["Приветствие и помощь",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1771013436",423000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1SQfkCvmwiGd7Ed30ejYgcf33oRwNg50P",null,null,null,["Hello, How Can I Help?",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1771013436",423000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/19_sXbM-sRckgI6eiAz48LRMwO2WnEEvg",null,null,null,["MakerSuite Service Definitions",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1771013436",422000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1vOokAJuLYuw5xEn3zcgjMUqkQW5Hfv_s",null,null,null,["Isolating Function Dependencies.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770833974",729000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/11jPwUvGmaxtZ7ATOA37yyICPrkGBoSqK",null,null,null,["Copy of Branch of Copy of Copy of Copy of Copy of Proxy Implementation Fixes Needed.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770659458",149000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1dC1a9Z0XRuaFsxrM5MyiNqkFyLlYLGyA",null,null,null,["What does GTR mean?",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770520245",709000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1hv__xPmSbBW1jAivK6S0sYPXODf7aA3m",null,null,null,["Google API Client Library Utilities.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770520245",709000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1jXNOqLSimD75XB3luur1ABSgc9XGmS8_",null,null,null,["Windows Curl Command Examples",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770520245",709000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1UGmvTDfhJ1mfmBqsI_8BTBhAVem4v4sD",null,null,null,["Greeting and Assistance Offered",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770520245",708000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/13cxYm04kIeACSXkKoSC9VWIX8X6g99LS",null,null,null,["Excited Celebration, How Can I Help?",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770520245",707000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1vz7fz528RrOWy8E0BoSX4EO7Ij2MTBzB",null,null,null,["Project Switch Bug Fixes",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770385805",793000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1FITOUYJlQhwP3G_0oweKpb-fp1wFCm5e",null,null,null,["Greeting and Offer of Help",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770385805",792000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/183k5RRRYWzpXR9vc6jg4q71C3uop3Q18",null,null,null,["Copy of Branch of Copy of Copy of IDE: HTML, CSS, VUE #12",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770385805",792000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/14Cl2dd96ymHEINtqsLIqe43q50F-ydrD",null,null,null,["How Can I Help You?",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770385805",792000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1hoW--Ygtyx7-J0JVZ4dwqmz1Rn4VO3ej",null,null,null,["Copy of IDE: HTML, CSS, VUE",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1770083821",301000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1Ty9KPGzg4wWU-VEOlYv2YAehy9wYuq5u",null,null,null,["Copy of Copy of Copy of IDE: HTML, CSS, Tailwind Fixes",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769996356",360000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1G00WO98cylfoB5bu-YyNA03CL-DdynIv",null,null,null,["Copy of Fixing Monaco's Fixed Widgets.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769982840",626000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1oa2V3mr9it7PQvraXEgsZD-MnQAhz1LU",null,null,null,["Monaco Editor Widget Styling Fix #2",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769870469",476000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1ZUuCZz7ES3xS8du7-_Gc8VA_6WKc46tM",null,null,null,["Ліки 2026 для літніх",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769870179",107000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1xQCc0lxYFGNNqmadVRvQzRPCAfUjZIE0",null,null,null,["Post VueSFC №16",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769738871",547000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1h4YfMxASccnbCu6pZ3VaWvdc9fXRAb85",null,null,null,["Зображення статті про вимкнення світла",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769738871",547000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1BY6o7-CzbUu9mdHiC0vKf9TDW8y25sd7",null,null,null,["Branch of Post VueSFC №12",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769543942",685000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1QAM0Ss8NlYXRzY1pQm4Wr5iBB79cKLeg",null,null,null,["Post VueSFC №12",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769543942",685000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1g1ClvLmq1x8RhhyhaIgi_ORYqS4osUz1",null,null,null,["Post VueSFC №11",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769445991",712000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1BF-HJgnDtnwSo8UDJmv6QAF0VEo3LIuT",null,null,null,["Branch of Post VueSFC №6",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769274375",244000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1VxykdLUD-KpgFtqxzbqDIc_CkdHxTRpw",null,null,null,["Post VueSFC №6",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769263859",293000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/173OlTsNKelcI1Xuql5EbhBRyZivmT0K3",null,null,null,["Replace Session Generator With Docker",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769210345",373000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1PngGf9C992by239xHmSjzvgf7Ab_oW-h",null,null,null,["Copy of Branch of Branch of Post VueSFC №4",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769045933",827000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1Dzobmg4YKQxgUikrgWhc_Sndgr1O5UcT",null,null,null,["Branch of Copy of Branch of Branch of Post VueSFC №4",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1769045933",827000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1yQAhW5WgWM3H8PcBRm1U-p2HWLDFJR_B",null,null,null,["Post VueSFC",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768588662",368000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1l5Kj-NlmlF5Mqi1hpnXugzLyKyBrQXtq",null,null,null,["Replace Console Logs with TSLog",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768588662",368000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1tE3PQkuZZsxO-gkRU0rpvDkhq44eHiH-",null,null,null,["Copy of Copy of Copy of Branch of Copy of Yjs Collab",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768519923",356000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1j19Hrg74vdzhUJ_x0_je5tCFvCS7OEju",null,null,null,["Webpack Bundled React Application Breakdown",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768492376",875000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1ydD7WZ3S5WvaQabe6Q_bAPYQn13CeW1H",null,null,null,["Branch of Copy of Branch of Copy of Copy of Branch of Copy of Monaco Vue SFC Support",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768343532",676000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1o3XHQbgidR_Z5kKOs01q52et46FP_SWu",null,null,null,["Copy of Branch of Copy of Copy of Branch of Copy of Monaco Vue SFC Support",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768342419",520000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/191lm2j0oqe7YF6--VXYmnhZCXDOjBO5c",null,null,null,["Copy of Copy of Vue Support Research",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768160124",861000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/15aFPmZ2EiiZLIoBS6Vmymhkq-h9S4Fpl",null,null,null,["Monaco Vue SFC Support",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1768160124",861000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1ZXZBtCxSEBnFoCHWp_Wz0uHrWqQmZqRs",null,null,null,["Branch of Copy of Copy of Copy of Branch of Copy of Yjs Collab",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767829462",247000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1bfNu8BYj_e03z0k43GTSxhmJ73hJ4GE3",null,null,null,["Branch of Branch of Copy of Copy of Copy of Branch of Copy of Yjs Collab",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767829462",247000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1uUAZK_9Nj7GRpRH6GHjL3WqJ9syzv4Cv",null,null,null,["Yjs Collab",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767393392",135000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/15mX_66138xQYDkKMG-XviGljQkond7k9",null,null,null,["Lightning-FS & Isomorphic-Git #5",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767148437",997000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1gjYPnHG5NNSbyi9gUt1Ej37B40JjWjA5",null,null,null,["Lightning-FS & Isomorphic-Git #4",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767148437",997000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/10_mcdWcc4KvNlzQZbDgOGJUreyzR2jmD",null,null,null,["Різдвяний Фон Для Поздоровлень",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1767148437",997000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1cSCJENgkJVBIgQwIaG9meYC4WDCKsn9i",null,null,null,["Lightning-FS & Isomorphic-Git #1",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766943352",560000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1xoRSXxSEAwiOjTgZpWOP3GIWrS-wVVuP",null,null,null,["OPFS & ORAMA #4",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766941555",380000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1gGUJzUbDhr-pYTF6calZzqTLQafZP2U9",null,null,null,["OPFS & ORAMA #3",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766798450",13000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1E9AfzaFG_dZH8g62XXqdTNjAktWjqV4T",null,null,null,["Branch of Branch of Branch of Branch of Branch of Copy of Copy of Branch of Branch of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766798450",12000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1zuGSmG_GG1SQ390zL0OqpjP8ITU5CsnD",null,null,null,["Branch of Branch of Branch of Branch of Branch of Branch of Branch of Copy of Copy of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766450951",200000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1RY-ymvfUNkGL0IiVMw42H3oUrWsNoIB-",null,null,null,["Branch of Branch of Branch of Branch of Branch of Branch of Copy of Copy of Branch of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766431860",718000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1S34DoHdde1L6WgEk_gb8OwjI7DNL2Rv7",null,null,null,["Branch of Branch of Branch of Branch of Copy of Copy of Branch of Branch of Branch of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766184482",447000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/12wsbWA-le-255NQ2lwZ-PyEOFvmn7XTX",null,null,null,["Branch of Branch of Branch of Copy of Copy of Branch of Branch of Branch of Branch of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766091441",343000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1Vc51CAiEv184jAu64eDbJB4aNzKv1kTZ",null,null,null,["Branch of Branch of Copy of Copy of Branch of Branch of Branch of Branch of Branch of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1766019968",778000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1vrPlMfoPLeriFTJ04Ga86_agWvdiYZpr",null,null,null,["Branch of Copy of Copy of Branch of Branch of Branch of Branch of Branch of Branch of Branch of Copy",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765814173",556000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1SrFKJeE1L2BruNRAOqaQIFnEO-IOFK0c",null,null,null,["Copy of Copy of Branch of Branch of Branch of Branch of Branch of Branch of Branch of Copy of Branch",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765635595",712000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1VdKT4hhWjmrC85OkcW5WPLzA4WMK7RdP",null,null,null,["Copy of Branch of Branch of Branch of Branch of Branch of Branch of Branch of Copy of Branch of Bran",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765635403",402000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1qIMt3Bef8N78YtFVqIHURO3HjWSk52CR",null,null,null,["Branch of Branch of Branch of Branch of Branch of Branch of Branch of Copy of Branch of Branch of Br",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765581989",563000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1IIhM6nCRhUko1D9hHBoGXkR6LafU3HCO",null,null,null,["Зміни стать персонажа",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765581715",981000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1SuFne3FlD7Tr36z2VQJCJ8JcsgApEOE7",null,null,null,["Branch of Branch of Branch of Branch of Branch of Branch of Copy of Branch of Branch of Branch of Vu",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765577341",291000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1wcZ3_SM4q-dHGzrNHQeyrNplA8LuXXrd",null,null,null,["Branch of Branch of Branch of Branch of Branch of Copy of Branch of Branch of Branch of Vue 3 Electr",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765403560",265000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/11cfpNusa3T3MtMvDbSZ-4RxLY-_64WOi",null,null,null,["Branch of Branch of Branch of Branch of Copy of Branch of Branch of Branch of Vue 3 Electron Card De",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765315304",245000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1JYSka8NZQKZRowioRa0IpKCxLcjbbRtr",null,null,null,["Branch of Branch of Branch of Copy of Branch of Branch of Branch of Vue 3 Electron Card Deck Builder",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765211589",967000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1rL2PW4A40WsuMvgFUoyn7S31cBgga7cy",null,null,null,["Branch of Branch of Branch of Branch of Copy of Branch of Branch of Branch of Vue 3 Electron Card De",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765210900",469000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1a4V95_mQpI8harYpMQrV7XI6s4rJaTqL",null,null,null,["IBC Deck Builder Project Files",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1765161906",225000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1RWX4224oNyPCZEPE8AtQSVjCabwmdgOZ",null,null,null,["Branch of Branch of Copy of Branch of Branch of Branch of Vue 3 Electron Card Deck Builder",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764895338",266000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/13PZtWzP05Kd_-XYK4v1TVB9IJDo_3IJg",null,null,null,["Branch of Copy of Branch of Branch of Branch of Vue 3 Electron Card Deck Builder",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764884146",271000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/11J29zeYjppWUCB8IHY1T1__TYNssML51",null,null,null,["Copy of Branch of Branch of Branch of Vue 3 Electron Card Deck Builder",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764884077",704000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1kQCcNSnoiybksoj0OPek9ruBlYyha8Ze",null,null,null,["High-Quality Image Creation",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764850716",211000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1DCkIibe5MH4DymDToAy4wJqUfynAZlko",null,null,null,["Hello, How Can I Help?",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764808702",191000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1QT4R-ndluuAzuG27p646ld-WaLhbmaTi",null,null,null,["Copy of Branch of Branch of Branch of Vue 3 Electron Card Deck Builder",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764808669",917000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1yUZu4gRCLbf109j6sp69Qv8qlIrvw4Z3",null,null,null,["Інтриг Великого Міста 2.5",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764618871",676000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1V1Adu3vTZwlT0-R1MDAIL8rmpzKdxTdV",null,null,null,["Інтриги Великого Міста 3.0",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764618858",189000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["version","1"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1zGbp2kvTySjCVxSWFv5Zfv8RRftQRpwc",null,null,null,["Game Card Template Markup",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764595150",985000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/18FfcfzjEFigh7lOH-Bt7-GivVZhogYiV",null,null,null,["Card Styling",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764547773",568000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/12j-CVMkxNt-v9qtnrOA1J9wcHtsVBjNw",null,null,null,["Правила Гри: Інтриги Великого Міста",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764461391",532000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1z8YObA8ZlNdDLYBefG2lRnNjRZkYR2bE",null,null,null,["Texture Request: Solid Gold",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764458013",212000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1VTcaM4FnFBIsiS9gxDlbd2RMnkSM1Jtg",null,null,null,["Icon Race Map Suggestion",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764453124",630000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1m9759RQYoamKE4Dg9tHVp1FekDhgMTS7",null,null,null,["Steam Avatar for Dota 2 Player",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764427733",318000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1HPqDx0o-uqiHgxXVLF_WeUi3JTTfSkVY",null,null,null,["Дизайн карточки для фоновых изображений",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764374236",631000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1EMUyokgg0ihQPeOUnRxtKJ72WSEuvVTT",null,null,null,["Офіційне Магічне Посвідчення Громадянина",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764265512",522000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1YFcV_0llK1UETwz3mDb8OqB32F18ZctV",null,null,null,["Branch of Зображення Монстрів Двері №2",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764265322",58000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1Dd-eHyc9rW8V0crpiGS_tML56jT3MlOY",null,null,null,["Дизайн Першої Сторінки Книги Правил",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764264198",70000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/17BLyMxt-WFAjR8rlq2pJd2AEndq3xsxr",null,null,null,["Зображення Монстрів Двері №2",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764174849",476000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1mhaCoh22-QzwFFOiQXQ0Phlj0jC5STDC",null,null,null,["Зображення Монстрів Двері №1",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764106051",248000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1qZqDbj9UPtXiq_BW4Tz_4JJFr3B_GX2e",null,null,null,["The Binding of Isaac: Untermenschen",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764071292",252000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1u7Pj-apYu7DkuC7uNIG8BiGbwHdT9crD",null,null,null,["Зображення Спорядження Скарбів №2",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1764021537",615000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1bdOnuWPF4DBKACrehYajzTJgE3KyBvXU",null,null,null,["Зображення Спорядження Скарбів",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763943365",733000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1ivU4pSFNTG9c-gu401DGTtgzXeiGPWnn",null,null,null,["Зображення Одноразових Скарбів",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763842701",78000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1BBR5mpbfBTaFRlJbJipmpdMsK6rvj5ym",null,null,null,["Зображення Спеціальних Скарбів",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763810651",479000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["version","1"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1uxgnbxceqM1JTscAkM736Z87cap7uNQ0",null,null,null,["Branch of Branch of Branch of Branch of Людина: Авантюрист біля таверни.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763759507",812000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["hasImages","false"],["promptType","CHUNKED_PROMPT"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1mywkq0k7Z0J3mVfyABSSmqHo366K7-mW",null,null,null,["Branch of Branch of Branch of Людина: Авантюрист біля таверни.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763682878",215000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1fHxq0ViQ24qNKjwRcN01jtr538sswKNr",null,null,null,["Напіврослика Як Приманка",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763682739",550000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1FXe_sDSfZf0NjoQJQJxt0IAgpeQODTXS",null,null,null,["Branch of Branch of Людина: Авантюрист біля таверни.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763510476",491000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1IpbNKC1cHBpwoL7HVpl2jlds9ItDde-t",null,null,null,["Branch of Людина: Авантюрист біля таверни.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763500845",876000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/13wHdCfHrQ-MXsT4mLCZFDKOs89xrC1Gv",null,null,null,["Інтриги Великого Міста",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763423168",146000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["hasImages","false"],["promptType","CHUNKED_PROMPT"]]],null,null,null,null,null,null,null,null,[]],["prompts/1G8tqpzephbuna00-A29oc5a-_CEpvvtz",null,null,null,["Людина: Авантюрист біля таверни.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763329429",109000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1PrEB7DKrXQYK_SwGFWJvBinLz2goDJa_",null,null,null,["Fantasy Portrait Of An Adventurer",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763302986",702000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1QBwdpLlEQtOLKlRzRDyQHPB8D_Ndl8qf",null,null,null,["Карта, монети, жінка-авантюристка.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763159975",839000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]],["prompts/1o_NefpswLuKz_GUz8ILYQuqLlZxx31_Y",null,null,null,["Іржава відмичка у схованці гільдії",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763129894",611000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["promptType","CHUNKED_PROMPT"],["hasImages","false"],["version","1"]]],null,null,null,null,null,null,null,null,[]],["prompts/1-56DHjWuhAuSmdBWPE2JJwFMVt46kl6x",null,null,null,["Сковорода з рунами у монастирі.",null,["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"],null,[["1763051748",730000000],["Some One",1,"https://lh3.googleusercontent.com/a/ACg8ocJWHE0LvjbkyhT9B7fN2GOulpvjOOf31gdGer6d4_jG8oOVFP5w=s64"]],[1,1,1],null,null,null,null,[],[["version","1"],["promptType","CHUNKED_PROMPT"],["hasImages","false"]]],null,null,null,null,null,null,null,null,[]]],"~!!~AI9FV7Q07uPqVU3tXLOdy6IRtYmjkLd1KUl9A7s4L7FnBjxLaHwlU48R9fypnYz5Wun4JIe836ESCT5okw2sdQ3LCyHGrSJaewUKvxKdfbnLLTnCuFSt1gDjNRjLl4Y8cFSRlNd_vVklAFdHrDtHH6Pn9fuztXYwTWLI3E8DKkHAN1Qg4Bu4dxmbf7nQIupkj0kjcgz7xFPtzp08bDlmsMjjjetnGBifHLktBXGMmqTRmz_TCZBBozDI5h17QuoSrYV9ovRABmg0jS0oOybMgWIKQUKLL9hEs0Q3qfHOsQP0H8TaL9JJwuzap8DHU7KskC5AxEku_2qL"]
```

## bscframe

```bash
curl 'https://aistudio.google.com/app/_/bscframe' \
  --compressed \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzW78Inb-Exw7kJC-d9U34d9S7dDbS8gn7fBmqQzJ8oe-JhOG_tfn1rOCbR3UKn1hJaeaA; __Secure-1PSIDCC=AKEyXzVy3O5cInzU9aLDOINB3h7oWKxzU8WSG-_XuU8JrbYkjxO7Zv9CUuX18WhhHf9rnoq3; __Secure-3PSIDCC=AKEyXzVM9rkFklExGD6tXW9aQZlhw19apAHSfmw3eKo9-PZIu0GeuXVOtgUKfUNN9ozHn2LYVQ; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Upgrade-Insecure-Requests: 1' \
  -H 'Sec-Fetch-Dest: iframe' \
  -H 'Sec-Fetch-Mode: navigate' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'Priority: u=4' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  -H 'TE: trailers'
```

Response:
```http
HTTP/3 200 
content-type: text/html; charset=utf-8
cache-control: no-cache, no-store, max-age=0, must-revalidate
pragma: no-cache
expires: Mon, 01 Jan 1990 00:00:00 GMT
date: Sat, 14 Feb 2026 18:19:52 GMT
content-security-policy: script-src 'unsafe-eval';require-trusted-types-for 'script';object-src 'none'
cross-origin-resource-policy: same-site
permissions-policy: ch-ua-arch=*, ch-ua-bitness=*, ch-ua-full-version=*, ch-ua-full-version-list=*, ch-ua-model=*, ch-ua-wow64=*, ch-ua-form-factors=*, ch-ua-platform=*, ch-ua-platform-version=*
accept-ch: Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Full-Version, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Model, Sec-CH-UA-WoW64, Sec-CH-UA-Form-Factors, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version
cross-origin-opener-policy: same-origin-allow-popups
content-encoding: gzip
server: ESF
x-xss-protection: 0
x-content-type-options: nosniff
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000

<!DOCTYPE html>
```

## GenerateContent
```bash
curl 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateContent' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en,en-US;q=0.9,ru-RU;q=0.8,ru;q=0.7' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://aistudio.google.com/' \
  -H 'X-Goog-Ext-519733851-bin: CAASA1JVQRgBMAE4BEAA' \
  -H 'X-Goog-Api-Key: AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs' \
  -H 'X-Goog-AuthUser: 0' \
  -H 'Authorization: SAPISIDHASH 1771093312_21549730565b7eddd365ff0523c867d9ebd906d9 SAPISID1PHASH 1771093312_21549730565b7eddd365ff0523c867d9ebd906d9 SAPISID3PHASH 1771093312_21549730565b7eddd365ff0523c867d9ebd906d9' \
  -H 'Content-Type: application/json+protobuf' \
  -H 'X-User-Agent: grpc-web-javascript/0.1' \
  -H 'Origin: https://aistudio.google.com' \
  -H 'DNT: 1' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: NID=528=dOBnm-2vbJni2gIoCcZqqgDUjSjSYS1ZKnMt9ftUb-NMwGnDSFFUkFZ5RaT_tPZE7KHiskPUM1qe-Pffc-pJPMZOQYEMBE050UIVink4mAN9ih50gX7FaK31MANs1j1VJFv9EHOqUVC81uw4DDZzy5zjMxmi74ERqguBCwz1mwBVdx3mGQD4t5XGnGJh1Ve82Z9u8HyxyOj0htIYO4QERBE-37b2akkckUF3Ue8gsJ77EMebwasPECzd5nsel0RdMYbMJbJSptDNUKC55d-CMldF6850972htaZY7tR8Cwm4b2hMGA-YaxwCg0tuHhkH1rJgmsXcdwj6XXjMH9n5vVqFflhOIlIbK9HcwpbhJvKiOQSOTKW18I9hgMDj3RsDFtO9A_p4OjQGCNndJm6yNVWiHFgw1u7_HIweQphZM1wk13PYXIUDAUEE-j1w47L0N4FK0ncpIMrYcPomSiWI0Mx-blp5ip-FqFpwPHUkiD6JEIhDYBdx1O7sFO-P-JI-FTGbh-LuKi7eCUvHx7bWxcbFpkgUyk4KyTSQDp9RWJS0BljRuL8L6gRE_BCH56c22xCn35Ut0OB5UV60RFiZgvYnOFjoQxbcIwz4Y8ORhp2MxJMJIvCNxbuZHRQkqsZQE_OzFDqkX7kq7WtGReUj0F50TtMomihsf7gNAsLjRVTk5oySXqi8JdQQXGsFQpbKikvGuMDTF25Z_qjPhF2hN3c40yRf5vBE; SID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjKnjaYFYUbo_jYsb6kgiQXwACgYKAWoSARASFQHGX2MinLhALypJP3gPKp7MhALHphoVAUF8yKpQOKwkJPTz3Ly7cKb7ZUoS0076; __Secure-1PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjsF0zMZNtiuG5cqYBsPai5QACgYKAfASARASFQHGX2Mi9STVMIJJhCgMVCV_5C6tZxoVAUF8yKrTs_DPSBdZCVvpIIqKdpEq0076; __Secure-3PSID=g.a0006wjcsKC7L7KcmdgppylWW10wHjyDalqhSfYvGmOceNrPurkjK1-W7e-0Kd2mJKZaGN44EQACgYKAcMSARASFQHGX2MibYoBDXPGrhUXTb1va_lZ0BoVAUF8yKppp3yQ8fNnCeIm8l882TQw0076; HSID=A0rwtzr7L7hv4HLRM; SSID=AZGRanWV0jKzDvA-4; APISID=n7IQERAWiw2UIuoM/AxEMWjh9BQ7DZJ_AP; SAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-1PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; __Secure-3PAPISID=xzxnHybJD2zmMmy0/AnScquCNsUoVKZ-V9; SIDCC=AKEyXzU_33Mo-NXn-Yml9AsHml3OBMLG6YDoDnNCSjL0bWWnc58iYmKV259VHsn48dq4B-vxZw; __Secure-1PSIDCC=AKEyXzXY8IFxyF4sjUdkH737fhfxG8bHy0qA2uNcbnMBSqATVMDhd53VmXjbB16zgz2rMczS; __Secure-3PSIDCC=AKEyXzXF3PHkv2dvLp93n5cROaHiL3A3NWVYf8lB1o_HHWkts123RsxwRyifQ7USufV8whLXyw; AEC=AaJma5u1J_9Fxh4wE9mj6oIjnVYU2MmTE-B4YHieg-iCVJSg4juPNf0GmA; __Secure-BUCKET=CHg; __Secure-1PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA; __Secure-3PSIDTS=sidts-CjEBBj1CYke0EV-nD8hMBvv7XiHPsdnJ2a8F3LWHpIeO8YRW0TaKzlsO8NWQHK345xf8EAA' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Priority: u=0' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  --data-raw $'["models/gemini-3-flash-preview",[[[[null,"Hi\041"]],"user"],[[[null,"Hello\041 How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"\041"]],"user"]],[[null,null,7,5],[null,null,8,5],[null,null,9,5],[null,null,10,5]],[null,null,null,65536,1,0.95,64,null,null,null,null,null,null,1,null,null,[1,null,null,3]],"\041qaqlqvLNAAaX9SMQt_VCQ8YuomocNTE7ADQBEArZ1GK5RkUfp8yU-HIm6lKGlmS5vxKea1KSvguVU97BQzlu35l6MtpZEEf1Fyr6h3R8AgAAAGpSAAAAA2gBB34AP-GEKuey2zFxHnDHeCjdUFQLOzYd2eZp9eQkIaIkBnE3Q4_Or0oEp4Gbj534XFgMLTOvW_TDgFlU6LZYcsfhh5kDTvzoPVj6vEFlJDPCjs1N90pyOTOJFXMdsepKhF-jbXtxpI8uS1SvDX0ONo-Up1W96OSp59FeRMOea4xhskEP5PhBv8cp04DNuOHV2zs6OVmNNjP9q1CmuMZB7HlY2oCU88_1QIrIODW1vG3IuNULBUWfDTsT7iCdB_vhqOrdxfhOdl9DKPwKP1Z3206FXGA3x1xEBubSdDHI_J1oqiIuMJWqYdZHSYc3MUqQ9thsqp3XUvpOJ5FYqTgYyx51DTxBeaFa8RACfKyqNGYGddZRhKnCtVVs43qp5FvoXSTlWpOJCdEqxN3bISWoFY08VD80KgY-DKpAeZTZjne1OY09Bb0AkzJaveqwbakaNwj3bEyWCtEMFf7fY7vPUIQoU7J-dTdTeAr9yq4X1cmyn5y5A74NWa7C02EvDtI_PG3gALQxVEMMp_X8oIsog_meJacV0sZAwyjwhjnECdrndsHEuOleCjS-UJhlzwDayA32aIaMb01QPEwydLs1UpxxiqvBf4ATR_XckZDOsMf-Kkq5iRYe-BiK1VM04t5z-yUR9FneICqhDgdu1AkOoumfs_dqlIfdp6jjShjhwY5PZ6Sf5ICykW9J1FoP4EQBcG6Fu5l1ThRPEHZ09NCqsiVDW7AU0rbizsv63vfej5CAdNROiFyOkzYAo8UYczY-mSFiFa70ORla7qsBGD02YRZlhZVYKftnd7DVphgDW48xhsN0tlcNZetYE3NJS7vvVpZYBCoduszms3o-7NOrDQZcW75yYmjSgItBvmEm4Ab7VqGUsPqYAyHH6zJHM_bPZyc-jtOSsawyubOMsE4Xls5JaF4a1r5ULVjxd7ofOb6wsAuStlnDCoME-8u9FJx4f5606-mnXipLSB-Lfryhs2q9jF0yBaBcVegh26FrPYveZvgRDa3dNpDHIuYzB49pFZiCLkYfawC5nx4QdT62xUpyJWK11O1b-gFutDAQU93PJPbIqgUm-VBUYRt7hQH8VpDX0AcchJ8B7eOM4MNAgGTLiRo7UFk1JRn_aduqrCu89nqhs07L08okYtt93NWMh7QctXZBV6QfdM6zze8X2FrV--VjdeiAnefu9wzBLYGEdMzHhfqAoE-69DLWuX7hICVhjg",null,[[null,null,null,[]]],null,null,null,1,null,null,[[null,null,"Europe/Kyiv"]]]'
```

Response:
```http
HTTP/3 200 
content-type: application/json+protobuf; charset=UTF-8
strict-transport-security: max-age=10886400; includeSubdomains
vary: Origin
vary: X-Origin
vary: Referer
content-encoding: gzip
date: Sat, 14 Feb 2026 18:21:54 GMT
server: ESF
x-xss-protection: 0
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
access-control-allow-origin: https://aistudio.google.com
access-control-allow-credentials: true
access-control-expose-headers: vary,vary,vary,content-encoding,transfer-encoding,date,server
server-timing: gfet4t7; dur=1543
set-cookie: SIDCC=AKEyXzXLgVn0ZQEw_CMDaZ3AR0A68D9-Hy60PMouZHDAr-wS9Lkss2ABeyRZJeXh6JnIpnKo4A; expires=Sun, 14-Feb-2027 18:21:54 GMT; path=/; domain=.google.com; priority=high
set-cookie: __Secure-1PSIDCC=AKEyXzWGdntyBzDcBUnciTKs1FwTKjtEfJvwUIzZ39z8hi2GXdI6p8A6V2IQYqV8tcta2gtt; expires=Sun, 14-Feb-2027 18:21:54 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high
set-cookie: __Secure-3PSIDCC=AKEyXzUxOlapFvc376RnUZS5vAmlXoCXRPYHlh_nvd5-wfFrXBZacxbkOoJkUTlv25ichWGbFA; expires=Sun, 14-Feb-2027 18:21:54 GMT; path=/; domain=.google.com; Secure; HttpOnly; priority=high; SameSite=none
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
expires: Sat, 14 Feb 2026 18:21:54 GMT
cache-control: private

[[[[[[[[null,"**Acknowledge the Response**\n\nI've registered the exclamation mark and interpreted it as potentially signifying excitement or playfulness. I'm focusing on crafting a friendly and engaging response that acknowledges this input without making any assumptions on the exact intent.\n\n\n",null,null,null,null,null,null,null,null,null,null,1]],"model"]]],null,[15,null,15,null,[[1,15]]],null,null,null,null,"v1_ChdRYjJRYWNhX0JlZnQ3TThQZy1TMnNBVRIXUXIyUWFhV3RIcnFVa2RVUHVLaXl5UVk"],[[[[[[null,"It looks like you're excited! Or maybe just testing out the buttons? \n\nEither way,"]],"model"]]],null,[15,21,108,null,[[1,15]],null,null,null,null,72],null,null,null,null,"v1_ChdRYjJRYWNhX0JlZnQ3TThQZy1TMnNBVRIXUXIyUWFhV3RIcnFVa2RVUHVLaXl5UVk"],[[[[[[null," I'm here if you have a question or just want to chat. What's on your mind?"]],"model"]]],null,[15,43,130,null,[[1,15]],null,null,null,null,72],null,null,null,null,"v1_ChdRYjJRYWNhX0JlZnQ3TThQZy1TMnNBVRIXUXIyUWFhV3RIcnFVa2RVUHVLaXl5UVk"],[[[[[[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"Es4DCssDAb4+9vsqotfuXI4zvLmCVkH3LC4FTi0oVFtY5ZxPLXYDFVJ4kNXM025m0cMtx7Jh7qJfhjGya3lovmDFnn31SWMfDjEZy/kpmHBHOQsfMzgOSHUKMAKmfWYrFk/th9nc2TnOpXmjppVgehzWHVOJsbTqIEmfDyKJlYnnlW8RKyTrWzEl5f7sRgs+bB5jLwWzUYEQttsKQzpam4t/6ydPpmHxjY6izBXx0ZjOB44kXTpPkF4j5JXxiaVZEUWlQqp5pkbRIToL7r5Pa3ghv5d4Tt27mXdVuzqw0vyDW1i3om+mR6p6UJToDcQcCbZc4/XREMgmgj/y4cPDaWeCpyw2Nf/jc0hqN2wHWUhKqvpOL5rQ/Z2GBYH6V1U0OHwtg+Xvux6DUkSIYuJhlOK+8af+qCERs1caoln/XqEvPsx2kMB4vpfB4sHG6lRXp030jpsUp9B+CARkNl2xBO0HAGX/Kx8YORG1zJQYzppCN9J8OAqGJkQrcooH4jvW4uOCgJ7f4SOcB2w98Ij7OMkGb7wLaJGqjo9qZOHFHe3+uTKezPiEOMJ5rxrn4fBsoRmqRe6CivoIerVC8jykM9jDNocwEY1YJPo4I7jNTeCv"]],"model"],1]],null,[15,43,130,null,[[1,15]],null,null,null,null,72],null,null,null,null,"v1_ChdRYjJRYWNhX0JlZnQ3TThQZy1TMnNBVRIXUXIyUWFhV3RIcnFVa2RVUHVLaXl5UVk"],[null,null,null,["1771093314497317",77875770,1764529208]]]]
```

---

# JS Debugger Trace

```javascript
        EGb = function(a /*somethign huge*/, b /* = [
    "10251BCC-BD3A-43CD-8B28-FA34EBCA2135",
    "C46DC3E5-B214-47FE-9958-5B960ACEFD2D",
    "8DEC18D2-2178-43AB-AE1C-C7F7BBFF77FD",
    "ACF2FF5B-B90D-4000-A33E-ECC23EEDC4D5"
] */, c /* = 0 */) {
            return _.x(function*() {
                const d = a.F.entities(); // = new Map([["text-input-chunk-id",{"Jb":"text","id":"text-input-chunk-id","role":"user","text":"","isJson":false}],["10251BCC-BD3A-43CD-8B28-FA34EBCA2135",{"id":"10251BCC-BD3A-43CD-8B28-FA34EBCA2135","role":"user","Jb":"text","tokenCount":3,"wb":1,"text":"Hi!","isJson":false}],["C46DC3E5-B214-47FE-9958-5B960ACEFD2D",{"id":"C46DC3E5-B214-47FE-9958-5B960ACEFD2D","role":"model","Jb":"text","parts":[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"Oi":{"finishReason":1},"tokenCount":9,"wb":1,"text":"Hello! How can I help you today?","isJson":false}],["8DEC18D2-2178-43AB-AE1C-C7F7BBFF77FD",{"id":"8DEC18D2-2178-43AB-AE1C-C7F7BBFF77FD","role":"user","Jb":"text","tokenCount":2,"wb":1,"text":"!","isJson":false}],["ACF2FF5B-B90D-4000-A33E-ECC23EEDC4D5",{"id":"ACF2FF5B-B90D-4000-A33E-ECC23EEDC4D5","Jb":"text","zm":true,"role":"model","text":"","thought":false}]])
                var e = b.map(O => d.get(O)) // = [{"id":"10251BCC-BD3A-43CD-8B28-FA34EBCA2135","role":"user","Jb":"text","tokenCount":3,"wb":1,"text":"Hi!","isJson":false},{"id":"C46DC3E5-B214-47FE-9958-5B960ACEFD2D","role":"model","Jb":"text","parts":[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"Oi":{"finishReason":1},"tokenCount":9,"wb":1,"text":"Hello! How can I help you today?","isJson":false},{"id":"8DEC18D2-2178-43AB-AE1C-C7F7BBFF77FD","role":"user","Jb":"text","tokenCount":2,"wb":1,"text":"!","isJson":false},{"id":"ACF2FF5B-B90D-4000-A33E-ECC23EEDC4D5","Jb":"text","zm":true,"role":"model","text":"","thought":false}]
                  , f = e[e.length - 1]; // = {"id":"ACF2FF5B-B90D-4000-A33E-ECC23EEDC4D5","Jb":"text","zm":true,"role":"model","text":"","thought":false}
                if (f == null ? 0 : f.Oi) // skipped
                    yield _.FGb(a, {
                        chunk: Object.assign({}, f, {
                            ar: !1,
                            Oi: void 0
                        })
                    });
                e.pop(); // e has now 3 elements, without the last one
                for (var g of e) {
                    var h = void 0;
                    (h = g) != null && h.ar && (yield _.FGb(a, {
                        chunk: Object.assign({}, g, {
                            ar: !1
                        })
                    }))
                }
                f = a.lb.R(c)(); // = ""
                g = a.lb.je(c)(); // = ""
                h = a.lb.Ee(c)(); // = 0
                var k = a.aa() // = [{"temperature":1,"model":"models/gemini-3-flash-preview","topP":0.95,"topK":64,"Tn":[],"maxOutputTokens":65536,"safetySettings":[[null,null,7,5],[null,null,8,5],[null,null,9,5],[null,null,10,5]],"enableCodeExecution":false,"enableBrowseAsATool":false,"ri":false,"responseModalities":[],"eg":false,"enableSearchAsATool":true,"aM":false,"googleSearch":[],"thinkingBudget":-1,"outputResolution":"1K","thinkingLevel":3}]
                  , n = a.ea(); // = [["models/gemini-3-flash-preview",null,"3-flash-preview-12-2025","Gemini 3 Flash Preview","Gemini 3 Flash Preview",1048576,65536,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.5,1]]],[[[null,1,3,1]]]],null,null,null,[["gemini-3-flash-preview",["1765987200"],null,["1735804800"]]],null,null,null,["gemini-3-flash-preview",["1765987200"],null,["1735804800"]],"Our most intelligent model built for speed, combining frontier intelligence with superior search and grounding.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/gemini-3"],null,null,null,null,null,null,null,null,[[[5,1],[1,6],[5,6],[5,3],[6,3]]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[5,13,1,9,48,18,10,3,6,7,43,45,16,28,12,2,8,25,52,23,4],null,null,null,null,null,null,[null,null,null,0,null,3,[4,1,2,3]],2,null,[10,17,11]]]
                if (k == null || n == null)
                    throw Error("Td");
                k = k[c]; // = {"temperature":1,"model":"models/gemini-3-flash-preview","topP":0.95,"topK":64,"Tn":[],"maxOutputTokens":65536,"safetySettings":[[null,null,7,5],[null,null,8,5],[null,null,9,5],[null,null,10,5]],"enableCodeExecution":false,"enableBrowseAsATool":false,"ri":false,"responseModalities":[],"eg":false,"enableSearchAsATool":true,"aM":false,"googleSearch":[],"thinkingBudget":-1,"outputResolution":"1K","thinkingLevel":3}
                n = n[c]; // = ["models/gemini-3-flash-preview",null,"3-flash-preview-12-2025","Gemini 3 Flash Preview","Gemini 3 Flash Preview",1048576,65536,["generateContent","countTokens","createCachedContent","batchGenerateContent"],1,0.95,64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2,null,null,null,null,null,null,null,null,null,null,[[[[[null,1,0.5,1]]],[[[null,1,3,1]]]],null,null,null,[["gemini-3-flash-preview",["1765987200"],null,["1735804800"]]],null,null,null,["gemini-3-flash-preview",["1765987200"],null,["1735804800"]],"Our most intelligent model built for speed, combining frontier intelligence with superior search and grounding.",null,null,null,null,null,"https://ai.google.dev/gemini-api/docs/gemini-3"],null,null,null,null,null,null,null,null,[[[5,1],[1,6],[5,6],[5,3],[6,3]]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[5,13,1,9,48,18,10,3,6,7,43,45,16,28,12,2,8,25,52,23,4],null,null,null,null,null,null,[null,null,null,0,null,3,[4,1,2,3]],2,null,[10,17,11]]
                e = Frb(a.ka, e.filter(O => O !== void 0), n); // = [[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]]
                const q = []; = // = []
                k.enableCodeExecution && q.push(_.o6a()); // since enableCodeExecution is false, this line is skipped
                var u; // = undefined
                k.eg && ((u = k.functionDeclarations) != null ? u : []).length > 0 && q.push(_.p6a(new _.jw, k.functionDeclarations)); // since eg is false, this line is skipped
                k.enableSearchAsATool && !(0,
                _.HE)(k.model) && q.push(_.q6a(new _.jw, k.googleSearch || new _.an)); // q = [[null,null,null,[]]] /* because enableSearchAsATool is true */
                k.enableBrowseAsATool && q.push(_.r6a()); // since enableBrowseAsATool is false, this line is skipped
                k.aM && q.push(s6a()); // since aM is false, this line is skipped
                if (k.enableSearchAsATool && !(0,
                _.HE)(k.model)) {
                    var w = new _.ow; // = []
                    (u = Intl.DateTimeFormat().resolvedOptions().timeZone) && _.Ij(w, 3, u); // = "Europe/Kiev"
                    w = M6a(w) // = [[null,null,"Europe/Kiev"]]
                }
                var y = void 0; // = undefined
                n && _.Hm(n).includes(25) && (y = _.w6a(new _.ws, !0), // y = [1]
                _.Um(n, 35) && _.w6a(_.Fk(y, 2, k.thinkingBudget), k.thinkingBudget !== 0),
                _.Um(n, 52) && _.Ck(y, 4, k.thinkingLevel));
                let B = void 0; // = undefined
                if (n) {
                    u = k.aspectRatio && _.Um(n, 47); // u = undefined 
                    const O = k.outputResolution && _.Um(n, 49); // O = false
                    if (u || O) // I believe this needed for image generation models, but 3 pro is text
                        B = new _.t6a,
                        u && _.Ij(B, 1, k.aspectRatio),
                        O && _.Ij(B, 2, k.outputResolution)
                }
                var G; // = undefined
                u = k.responseModalities && ((G = k.responseModalities) == null ? void 0 : G.length) > 0; // u = false (responseModalities is empty)
                G = K6a(_.I6a(_.nw(G6a(_.F6a(J6a(E6a(_.C6a(_.B6a(_.A6a(_.z6a(y6a(x6a(new _.Vm, k.Tn), k.maxOutputTokens), k.temperature), k.topP), k.topK || void 0), k.responseMimeType), k.responseMimeType === "application/json" ? k.eo : void 0), k.seed), mza(Object.assign({}, k, {
                    baseModel: n
                })) || void 0), u ? [...k.responseModalities] : void 0), k.speechConfig), y), B); // = [null,null,null,65536,1,0.95,64,null,null,null,null,null,null,1,null,null,[1,null,null,3]]
                (y = DGb(n, k)) && _.Wya(G, _.Wm(y, 18));
                y = a.F.fc(); // = [{"ld":["10251BCC-BD3A-43CD-8B28-FA34EBCA2135","C46DC3E5-B214-47FE-9958-5B960ACEFD2D","8DEC18D2-2178-43AB-AE1C-C7F7BBFF77FD","ACF2FF5B-B90D-4000-A33E-ECC23EEDC4D5"],"qq":"ACF2FF5B-B90D-4000-A33E-ECC23EEDC4D5","systemInstructions":"","sV":[],"Ny":"","up":false,"Vf":"ACF2FF5B-B90D-4000-A33E-ECC23EEDC4D5","Mob":"v1_ChdfTXVRYWM3YUlvUFk3TThQNS1QNXVBWRIUczlDUWFaeVhCNWpIdmRJUDdJY1c","qt":"end","z2":["1771098291117660",72311704,361452]}]
                w = D7a(C7a(B7a(z7a(_.A7a(_.y7a(x7a(w7a(new _.tw, e).setModel(k.model), k.safetySettings), G), n && _.Im(n) && f ? _.gw(_.fw(new _.hw, [(new _.Uu).setText(f)]), "user") : null), g ? t7a(s7a(new _.u7a, _.gw(_.fw(new _.hw, [(new _.Uu).setText(g)]), "user")), h) : null), q), w), y[c].Mob);
                u && D6a(_.Sm(w, _.Vm, 4)); // = false
                if (a.Aa.Ab() && !a.lc) { // skipped
                    var N;
                    w.setApiKey((N = a.Aa.Ab()) == null ? void 0 : _.Hn(N))
                }
                N = yield _.l5a(w); // (second run) = "55b9927465dc356397fac3c2094862bcb9d36ec99ca7526b28e01146d873cb62"
                N = yield _.Wv(a.Eb, N); // = "!NzSlNGzNAAaX9SMQt_VC6fnV5KsYUB07ADQBEArZ1ApJVzYO2VG3lnJK41CzXLw1LPtLtQjAoUwhVaM1D0O03EX8oBAp31gnslG_FIHjAgAAADBSAAAAAWgBB34AQRN9MpN7OhhhyJapGeA-JHBt9G3eIfwU_3k6rroDecQ1aTr58Xs9TmqEKfrJoA_sk-UFd4UwN9BIcLP6P3uYzyd5mQOlVq_McFIC2EsSR29KR_b7k0zwpDb6poRGaseF7niAQA3fm2r4hSn93OkBSqYIaBTioL-Kg5ywnd5Q60tXNPmKZVdPGPEOuYzKu7zefSXAJyUwvSkVZAZGWDdoRB-VzZkKyF9kQLC7e5jYEP3jOr4l0VBJ47ae9I0qlta_cER-bvbqLqDd1PljDyad3rqLgumLzFqvnWjY-X0BZy8I8hzbhybpp13yGiQPSLf_Ds5JKiuks4qn-1rlhlQMDFIGlVm3SOJTz3Ydn6xPuz8VlMx67J1Ma7djburYlw1W_PsXFP3pti4Yd292mpPshV8joH7sAuU1_2POzE5Hm9JgGRgcIpxIKzKCtdn4uLAntP5mtStFQqrpiD0kyLJq-TMzn_fuvMcDW81b2RxKzXsoBwjcw7EEPwP4FLFJMIBnnmKVVkZaZWkUnyljLvID1J8QyBJwUJh4S38JK0c0eh33r4G1LWB0pA0sqctHThT674bU3fxl1qyyN09wc2ft3hsUJlbJ86yi91WftaiNSA8mfWaadBGZ6Zq8hLxOIZ_7bhs8S3I07rvdxxxL-P_lu3QfnUBfa1OcrB1wCyXex4_PG1VJdfXsAmRQc1oaduZKaBvNStRi1X3GQlZL4-NSY5VLtTT54NbeL2krDi4U-vvFPL8cBYxzNj59JQMZ301yxgfOE7z_SHuziqVNnP_pDqSwPHQVaqfiLIsnQHTyRNXR90Z-85fmNIDZr_FJqTcCzAUmCbngR23kHDaQarQAaJ7v9PC5_jXkBbq6HVmUOXT2dUk_LMLxIjUbGHyaqyrZhF6lkMHCvkpNKdRJggmzr32po_zNwfzs68xVBIlEh-Hi2tf9_j8Faa8MfI5EMh4_2sD9SseLklTa4G5zmlTE7gIY4B_BNVAdyo97uAVqQoTvHoM2PtzZouq3BrQgP-wbrQUDyFbSdCm6UsiPrMTMWmKlrR8VZ6C2G84VCRiz0Vy2Qjj97tcWSJuoeBfpAMxI8Qz5wwpgTAdj66AJADGCqqP4HjJk2nTsXs-pjZbB9pM0hidUsx50HAOtwNPj7xuV-eVRQRaX5-FB0EHZTn_fRgfwNSruMw12b_wAoJSNFUm8Hj8MsBqUA0y5xay5Y2Hws6EldhFuGyRtGa1d8MrrXVkJQliVShgtexFhOXIag0_we6B_vcVoQuFv3SDRI8uHqC1_OCI4wAbcByQ-ztF-rMJ6A82LV1MQvwbAK-C40pRQJwJaq_BXo5Wk" (second run) = "!d3SldCzNAAaX9SMQt_VC6fnV5KsYUB07ADQBEArZ1ApJVzYO2VG3lnJK41CzXLw1LPtLtQjAoUwhVaM1D0O03EX8oBAp31gnslG_FIHjAgAAADBSAAAAAWgBB34AQRN9MpN7OhhhyJapGeA-JHBt9G3eIfwU_3k6rroDecQ1aTr58Xs9TmqEKfrJoA_sk-UFd4UwN9BIcLP6P3uYzyd5mQOlVq_McFIC2EsSR29KR_b7k0zwpDb6poRGaseF7niAQA3fm2r4hSn93OkBSqYIaBTioL-Kg5ywnd5Q60tXNPmKZVdPGPEOuYzKu7zefSXAJyUwvSkVZAZGWDdoRB-VzZkKyF9kQLC7e5jYEP3jOr4l0VBJ47ae9I0qlta_cER-bvbqLqDd1PljDyad3rqLgumLzFqvnWjY-X0BZy8I8hzbhybpp13yGiQPSLf_Ds5JKiuks4qn-1rlhlQMDFIGlVm3SOJTz3Ydn6xPuz8VlMx67J1Ma7djburYlw1W_PsXFP3pti4Yd292mpPshV8joH7sAuU1_2POzE5Hm9JgGRgcIpxIKzKCtdn4uLAntP5mtStFQqrpiD0kyLJq-TMzn_fuvMcDW81b2RxKzXsoBwjcw7EEPwP4FLFJMIBnnmKVVkZaZWkUnyljLvID1J8QyBJwUJh4S38JK0c0eh33r4G1LWB0pA0sqctHThT674bU3fxl1qyyN09wc2ft3hsUJlbJ86yi91WftaiNSA8mfWaadBGZ6Zq8hLxOIZ_7bhs8S3I07rvdxxxL-P_lu3QfnUBfa1OcrB1wCyXex4_PG1VJdfXsAmRQc1oaduZKaBvNStRi1X3GQlZL4-NSY5VLtTT54NbeL2krDi4U-vvFPL8cBYxzNj59JQMZ301yxgfOE7z_SHuziqVNnP_pDqSwPHQVaqfiLIsnQHTyRNXR90Z-85fmNIDZr_FJqTcCzAUmCbngR23kHDaQarQAaJ7v9PC5_jXkBbq6HVmUOXT2dUk_LMLxIjUbGHyaqyrZhF6lkMHCvkpOPTAd8ezmMq1nwOtmBVxW1GOscKlCkuG7r5RQRwpSMD53RHfXCDoF5vFqvKtEhe7KQN18Ez9bD_ejSH4gkND8gc18rLMwqaIvSClcdN-7u3WJyV4S--Fun6CqfOJcnB4ZVMmgrt1YsxPfnu-_iszNUQR4svvOdAZi6ukicMyzTG1Q38tU-azr7G-dvKjJGAoGAnveelRCGY9TTJD7_vEgG7RJkNR9tM_PDVmKv9IQcLFz2TnpTueHwfvMmhHiYNsv25m4hDaTyjBzBjZpaEbZ_zak0JNuGRKD6XH-wRF6D6bivLUgIB-JLjQMfjifdOvQ5atSEdtZeymvGBiQwE_WUQt4elFopkMKNDu0bNWVnbaTpEkhOlX_q9fMIiipWe-xmLUeGFdH7f0ydOt_LNxYRWJ9mcT7HRArlkoc7uTAsoCM"
                _.dd(w, 5, N);
                GGb(a, {
                    request: w,
                    index: c
                })
            })
        };

        _.l5a = function(a) {
            return _.x(function*() {
                const b = _.Xv(a).flatMap(c => c.xg()).map(_.rj); // = ["Hi!","Hello! How can I help you today?","","!"]
                return _.Vu(b.join(" "))
            })
        };

        _.x = function(a) {
            return OVa(a())
        };

        OVa = function(a) {
            function b(d) {
                return a.next(d)
            }
            function c(d) {
                return a.throw(d)
            }
            return new Promise(function(d, e) {
                function f(g) {
                    g.done ? d(g.value) : Promise.resolve(g.value).then(b, c).then(f, e)
                }
                f(a.next())
            }
            )
        };

        _.Wv = function(a, b /*="55b9927465dc356397fac3c2094862bcb9d36ec99ca7526b28e01146d873cb62"*/) {
            return _.x(function*() {
                yield a.R;
                // a.F is huge
                return a.F ? a.F.snapshot({ 
                    Kgb: {
                        content: b
                    }
                }) : ""
            })
        };

        _.Xv = function(a) {
            return _.tj(a, _.hw, 2, _.uj())
        }
        ;
        _.uj = function(a) {
            return a === _.KWa ? 2 : 4
        }
        _.tj = function(a, b /* = class extends */, c /* = 2 */, d /* = 4 */, e /* = undefined*/) {
            const f = a.Kd; // = ["models/gemini-3-flash-preview",[[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]],[[null,null,7,5],[null,null,8,5],[null,null,9,5],[null,null,10,5]],[null,null,null,65536,1,0.95,64,null,null,null,null,null,null,1,null,null,[1,null,null,3]],null,null,[[null,null,null,[]]],null,null,null,null,"v1_ChdfTXVRYWM3YUlvUFk3TThQNS1QNXVBWRIXWE5lUWFZN2NMYTdubnNFUGphajFvUUk",null,[[null,null,"Europe/Kiev"]]]
            return _.Kc(a, f, f[_.bb] | 0, b, c, d, e, !1, !0)
        }

        _.Kc = function(a, b, c, d, e, f, g, h, k) {
            var n = kb(a, c); // = false
            f = n ? 1 : f; // = 4
            h = !!h || f === 3; // h = false
            n = k && !n; // n = true, k = true
            (f === 2 || n) && sc(a) && (b = a.Kd, // f = 4, b = ["models/gemini-3-flash-preview",[[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]],[[null,null,7,5],[null,null,8,5],[null,null,9,5],[null,null,10,5]],[null,null,null,65536,1,0.95,64,null,null,null,null,null,null,1,null,null,[1,null,null,3]],null,null,[[null,null,null,[]]],null,null,null,null,"v1_ChdfTXVRYWM3YUlvUFk3TThQNS1QNXVBWRIXWE5lUWFZN2NMYTdubnNFUGphajFvUUk",null,[[null,null,"Europe/Kiev"]]]
            c = b[_.bb] | 0); // 6240
            a = Sca(b, e, g); // [[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]]
            var q = a === _.wc ? 7 : a[_.bb] | 0 // q = 4101
              , u = Tca(q, c); // u = 4101, c = 6240
            if (k = !(4 & u)) { // k = false, so this block is skipped
                var w = a
                  , y = c;
                const B = !!(2 & u);
                B && (y |= 2);
                let G = !B
                  , N = !0
                  , O = 0
                  , P = 0;
                for (; O < w.length; O++) {
                    const R = dc(w[O], d, !1, y);
                    if (R instanceof d) {
                        if (!B) {
                            const V = kb(R);
                            G && (G = !V);
                            N && (N = V)
                        }
                        w[P++] = R
                    }
                }
                P < O && (w.length = P);
                u |= 4;
                u = N ? u & -4097 : u | 4096;
                u = G ? u | 8 : u & -9
            }
            u !== q && (a[_.bb] = u, // u = 4101, q = 4101, so this line is not executed
            2 & u && Object.freeze(a));
            if (n && !(8 & u || !a.length && (f === 1 || (f !== 4 ? 0 : 2 & u || !(16 & u) && 32 & c)))) {
                zc(u) && (a = [...a],
                u = xc(u, c), // u = 4101, c = 6240, so u remains 4101
                c = _.vc(b, c, e, a, g)); // c = 6240
                d = a; // d = [[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]]
                n = u; // n = 4101
                for (q = 0; q < d.length /* = 3 */; q++)
                    w = d[q],
                    u = _.hc(w),
                    w !== u && (d[q] = u);
                // w = [[[null,"!"]],"user"]
                // u = [[[null,"!"]],"user"]
                // d = [[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]]
                n |= 8; // n = 4109
                u = n = d.length ? n | 4096 : n & -4097;
                a[_.bb] = u // a = [[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]]
            }
            return a = Vca(a, u, b, c, e, g, f, k, h)
        };

        kb = function(a, b /* = 6240 */) {
            return b === void 0 ? a.R !== jb && !!(2 & (a.Kd[_.bb] | 0)) : !!(2 & b) && a.R !== jb
        };

        Vca = function(a /* [[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]] */, b /* = 4109 */, c /* = ["models/gemini-3-flash-preview",[[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]],[[null,null,7,5],[null,null,8,5],[null,null,9,5],[null,null,10,5]],[null,null,null,65536,1,0.95,64,null,null,null,null,null,null,1,null,null,[1,null,null,3]],null,null,[[null,null,null,[]]],null,null,null,null,"v1_ChdfTXVRYWM3YUlvUFk3TThQNS1QNXVBWRIXWE5lUWFZN2NMYTdubnNFUGphajFvUUk",null,[[null,null,"Europe/Kiev"]]] */, d /* = 6240 */, e /* = 2 */, f /* = undefined */, g /* = 4 */, h /* = false */, k /* = false */) {
            let n = b; // n = 4109
            g === 1 || (g !== 4 ? 0 : 2 & b || !(16 & b) && 32 & d) ? zc(b) || (b |= !a.length || h && !(4096 & b) || 32 & d && !(4096 & b || 16 & b) ? 2 : 256,
            b /* 4365 */ !== n /* 4109 */ && (a[_.bb] = b /* 4365 */), 
            Object.freeze(a)) : (g === 2 && zc(b) && (a = [...a],
            n = 0,
            b = xc(b, d),
            d = _.vc(c, d, e, a, f)),
            zc(b) || (k || (b |= 16),
            b !== n && (a[_.bb] = b))); // n = 4109, a = [[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]]
            2 & b || !(4096 & b || 16 & b) || _.uc(c, d);
            return a // = [[[[null,"Hi!"]],"user"],[[[null,"Hello! How can I help you today?"],[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw=="]],"model"],[[[null,"!"]],"user"]]
        };

        _.hw = class extends _.l {
            constructor(a) {
                super(a)
            }
            xg() {
                return _.tj(this, _.Uu, 1, _.uj())
            }
            lr() {
                return _.m(this, 2)
            }
        };

        _.uj = function(a /*1: a=undefined 2: a=undefined  3: a=undefined*/) {
            return a === _.KWa ? 2 : 4
        };

        _.rj = function(a/*=[null,"Hi!"]*/) {
            switch (_.mj(a)) {
            case 2:
                return a.getText(); // in this case it is text
            case 3:
                let b, c;
                return (b = _.nj(a)) == null ? void 0 : (c = b.getData()) == null ? void 0 : _.oc(c);
            case 6:
                let d;
                return (d = _.oj(a, _.pj, 6, _.qj)) == null ? void 0 : d.getId();
            default:
                return ""
            }
        };
        _.mj = function(a) {
            return _.Tn(a, _.qj /* = [2,3,5,6,7,8,9,11,12,17,18]*/)
        }
        _.Tn = function(a, b) {
            a = a.Kd;
            return cda(bda(a), a, void 0, b)
        };
        bda = function(a) {
            let b;
            return (b = a[ada]) != null ? b : a[ada] = new Map // new Map([[[2,3,5,6,7,8,9,11,12,17,18],2]])
        };
        _.Vu = function(a) {
            a = (new TextEncoder).encode(a);
            const b = new zpa; // = {"blockSize":64,"R":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0,"31":0,"32":0,"33":0,"34":0,"35":0,"36":0,"37":0,"38":0,"39":0,"40":0,"41":0,"42":0,"43":0,"44":0,"45":0,"46":0,"47":0,"48":0,"49":0,"50":0,"51":0,"52":0,"53":0,"54":0,"55":0,"56":0,"57":0,"58":0,"59":0,"60":0,"61":0,"62":0,"63":0},"J":0,"aa":0,"F":{"0":1779033703,"1":-1150833019,"2":1013904242,"3":-1521486534,"4":1359893119,"5":-1694144372,"6":528734635,"7":1541459225},"fa":8,"ea":[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],"ha":{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0,"31":0,"32":0,"33":0,"34":0,"35":0,"36":0,"37":0,"38":0,"39":0,"40":0,"41":0,"42":0,"43":0,"44":0,"45":0,"46":0,"47":0,"48":0,"49":0,"50":0,"51":0,"52":0,"53":0,"54":0,"55":0,"56":0,"57":0,"58":0,"59":0,"60":0,"61":0,"62":0,"63":0}}
            b.update(a); // b = {"0":72,"1":105,"2":33,"3":32,"4":72,"5":101,"6":108,"7":108,"8":111,"9":33,"10":32,"11":72,"12":111,"13":119,"14":32,"15":99,"16":97,"17":110,"18":32,"19":73,"20":32,"21":104,"22":101,"23":108,"24":112,"25":32,"26":121,"27":111,"28":117,"29":32,"30":116,"31":111,"32":100,"33":97,"34":121,"35":63,"36":32,"37":32,"38":33}
            return maa(b.digest()/*=[85,185,146,116,101,220,53,99,151,250,195,194,9,72,98,188,185,211,110,201,156,167,82,107,40,224,17,70,216,115,203,98]*/) // = "55b9927465dc356397fac3c2094862bcb9d36ec99ca7526b28e01146d873cb62"
        };
        zpa = function() {
            sj.call(this, 8, ypa)
        };
        sj = function(a /*=8*/, b/*=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225]*/) {
            this.blockSize = -1;
            this.blockSize = 64;
            this.R = _.ja.Uint8Array ? new Uint8Array(this.blockSize) : Array(this.blockSize);
            this.aa = this.J = 0;
            this.F = [];
            this.fa = a; // = 8
            this.ea = b; 
            this.ha = _.ja.Int32Array ? new Int32Array(64) : Array(64);
            wpa === void 0 && (_.ja.Int32Array ? wpa = new Int32Array(xpa) : wpa = xpa);
            this.reset()
        };
        sj.prototype.digest = function() {
            const a = [];
            var b = this.aa * 8;
            this.J < 56 ? this.update(B0a, 56 - this.J) : this.update(B0a, this.blockSize - (this.J - 56));
            for (var c = 63; c >= 56; c--)
                this.R[c] = b & 255,
                b /= 256;
            C0a(this);
            b = 0;
            for (c = 0; c < this.fa; c++)
                for (let d = 24; d >= 0; d -= 8)
                    a[b++] = this.F[c] >> d & 255;
            return a
        }
        ;
        maa = function(a) {
            return Array.prototype.map.call(a, function(b) {
                b = b.toString(16);
                return b.length > 1 ? b : "0" + b
            }).join("")
        }
        ;
           k4a = class extends _.kk {
            constructor(a) {
                super();
                this.options = a;
                this.fa = new _.zv;
                this.Nxa = this.fa.promise;
                this.R = new _.zv;
                this.aa = new _.zv;
                this.ea = [];
                this.isPaused = !1;
                this.logger = new K3a(Hqa(a.wta || {}));
                h4a(this, a.fetcher, a.fKb, a.scriptLoader, a.GMb, Object.assign({}, j4a, a.aNb || {}));
                _.Yj(this, () => void i4a(this))
            }
            snapshot(a) {
                const b = this;
                return _.x(function*() {
                    if (b.isDisposed())
                        throw Error("jb");
                    b.J || b.ha || (yield b.R.promise);
                    if (b.J)
                        return yield b.J.snapshot(a);
                    throw b.ha;
                })
            }
            pause() {
                this.isDisposed() || this.isPaused || (this.isPaused = !0,
                this.F && this.F.pause())
            }
            resume() {
                !this.isDisposed() && this.isPaused && (this.isPaused = !1,
                this.F && this.F.resume())
            }
            handleError(a) {
                if (!this.isDisposed()) {
                    this.ha = a;
                    this.R.resolve();
                    var b, c;
                    (c = (b = this.options).oLb) == null || c.call(b, a)
                }
            }
            dWa() {
                return this.logger.share()
            }
        };
/* LOCALS
b = [{"request":"1","index":0},["2","3","4","5","6",null,"7",null,null,null,1,"8",null,"9"],"models/gemini-3-flash-preview",["10","11","12"],["13","14","15","16"],[null,null,null,65536,1,0.95,64,null,null,null,null,null,null,1,null,null,"17"],"!8POl86vNAAaX9SMQt_VC6fnV5KsYUB07ADQBEArZ1ApJVzYO2VG3lnJK41CzXLw1LPtLtQjAoUwhVaM1D0O03EX8oBAp31gnslG_FIHjAgAAADBSAAAAAmgBB34AQRN9MpN7OhhhyJapGeA-JHBt9G3eIfwU_3k6rroDecQ1aTr58Xs9TmqEKfrJoA_sk-UFd4UwN9BIcLP6P3uYzyd5mQOlVq_McFIC2EsSR29KR_b7k0zwpDb6poRGaseF7niAQA3fm2r4hSn93OkBSqYIaBTioL-Kg5ywnd5Q60tXNPmKZVdPGPEOuYzKu7zefSXAJyUwvSkVZAZGWDdoRB-VzZkKyF9kQLC7e5jYEP3jOr4l0VBJ47ae9I0qlta_cER-bvbqLqDd1PljDyad3rqLgumLzFqvnWjY-X0BZy8I8hzbhybpp13yGiQPSLf_Ds5JKiuks4qn-1rlhlQMDFIGlVm3SOJTz3Ydn6xPuz8VlMx67J1Ma7djburYlw1W_PsXFP3pti4Yd292mpPshV8joH7sAuU1_2POzE5Hm9JgGRgcIpxIKzKCtdn4uLAntP5mtStFQqrpiD0kyLJq-TMzn_fuvMcDW81b2RxKzXsoBwjcw7EEPwP4FLFJMIBnnmKVVkZaZWkUnyljLvID1J8QyBJwUJh4S38JK0c0eh33r4G1LWB0pA0sqctHThT674bU3fxl1qyyN09wc2ft3hsUJlbJ86yi91WftaiNSA8mfWaadBGZ6Zq8hLxOIZ_7bhs8S3I07rvdxxxL-P_lu3QfnUBfa1OcrB1wCyXex4_PG1VJdfXsAmRQc1oaduZKaBvNStRi1X3GQlZL4-NSY5VLtTT54NbeL2krDi4U-vvFPL8cBYxzNj59JQMZ301yxgfOE7z_SHuziqVNnP_pDqSwPHQVaqfiLIsnQHTyRNXR90Z-85fmNIDZr_FJqTcCzAUmCbngR23kHDaQarQAaJ7v9PC5_jXkBbq6HVmUOXT2dUk_LMLxIjUbGHyaqyrZhF6lkMHCvkpNXtRJggmzr3165pPD1nRLoJ6TUaSKHlfi38QSuPljyKG9vvBC9e73dlY42iJLCA_qarnIQUBa0XBOd94aevoPdJr0gP_n-LpFdhosXCCaegaVyGuyYsu7IifhOOAoB80opMqMdTWUVw05abZ_4p29qdWm7WU4iGtw5ZdSG9Z5GfHkRoz_fZ9ECdqO9_IHEGCrptsBf4Nwa1pVvHQ5O696hLAiHzdx3sPutvKIkz7LMuAmfWR4Sybg4pvsahPEOmhp-1xcWeIpTTSket4bF9JddfMfw-GQOd5rZEHCH3mo6YmAHZvty8BkbmHwtuiBoQJlws_iSr0LgzEwZdv9p484AS78mQvhJy9HuXfoZjw8MDqqqRdT_Ief11xRbwvr54-XS5KhGmlbq6P_wk0MGDT7rzALVSiaJ8uB8f4y_GzOR5Kq",["18"],"v1_ChdfTXVRYWM3YUlvUFk3TThQNS1QNXVBWRIXSnM2UWFmU2NLb194N004UG1iZkZvQVU",["19"],["20","21"],["22","23"],["24","21"],[null,null,7,5],[null,null,8,5],[null,null,9,5],[null,null,10,5],[1,null,null,3],[null,null,null,"25"],[null,null,"26"],["27"],"user",["28","29"],"model",["30"],[],"Europe/Kiev",[null,"31"],[null,"32"],[null,"33",null,null,null,null,null,null,null,null,null,null,null,null,"34"],[null,"35"],"Hi!","Hello! How can I help you today?","","EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw==","!"]
*/
      GGb = function (a, b) {
        // a = /* something huge */
        // b = [{"request":"1","index":0},["2","3","4","5","6",null,"7",null,null,null,null,"8",null,"9"],"models/gemini-3-flash-preview",["10","11","12"],["13","14","15","16"],[null,null,null,65536,1,0.95,64,null,null,null,null,null,null,1,null,null,"17"],"!WFulWwPNAAaX9SMQt_VC6fnV5KsYUB07ADQBEArZ1ApJVzYO2VG3lnJK41CzXLw1LPtLtQjAoUwhVaM1D0O03EX8oBAp31gnslG_FIHjAgAAADBSAAAAAWgBB34AQRN9MpN7OhhhyJapGeA-JHBt9G3eIfwU_3k6rroDecQ1aTr58Xs9TmqEKfrJoA_sk-UFd4UwN9BIcLP6P3uYzyd5mQOlVq_McFIC2EsSR29KR_b7k0zwpDb6poRGaseF7niAQA3fm2r4hSn93OkBSqYIaBTioL-Kg5ywnd5Q60tXNPmKZVdPGPEOuYzKu7zefSXAJyUwvSkVZAZGWDdoRB-VzZkKyF9kQLC7e5jYEP3jOr4l0VBJ47ae9I0qlta_cER-bvbqLqDd1PljDyad3rqLgumLzFqvnWjY-X0BZy8I8hzbhybpp13yGiQPSLf_Ds5JKiuks4qn-1rlhlQMDFIGlVm3SOJTz3Ydn6xPuz8VlMx67J1Ma7djburYlw1W_PsXFP3pti4Yd292mpPshV8joH7sAuU1_2POzE5Hm9JgGRgcIpxIKzKCtdn4uLAntP5mtStFQqrpiD0kyLJq-TMzn_fuvMcDW81b2RxKzXsoBwjcw7EEPwP4FLFJMIBnnmKVVkZaZWkUnyljLvID1J8QyBJwUJh4S38JK0c0eh33r4G1LWB0pA0sqctHThT674bU3fxl1qyyN09wc2ft3hsUJlbJ86yi91WftaiNSA8mfWaadBGZ6Zq8hLxOIZ_7bhs8S3I07rvdxxxL-P_lu3QfnUBfa1OcrB1wCyXex4_PG1VJdfXsAmRQc1oaduZKaBvNStRi1X3GQlZL4-NSY5VLtTT54NbeL2krDi4U-vvFPL8cBYxzNj59JQMZ301yxgfOE7z_SHuziqVNnP_pDqSwPHQVaqfiLIsnQHTyRNXR90Z-85fmNIDZr_FJqTcCzAUmCbngR23kHDaQarQAaJ7v9PC5_jXkBbq6HVmUOXT2dUk_LMLxIjUbGHyaqyrZhF6lkMHCvkpNYdRJggmzr33qDV_GGpqMvcgIaW5cFUAHfUkrxjTM7b9kslJjrZHvJcsNYcXdJY6vygd9y16nnw--J7ZHXxph0Ksf8Wr2uH4ZMNxhnpk_F1npmGERJYnoPaY9mUGtXepq4ARsHXkh_9g8OqA4O_S9ups7RpqcQf1sf8sT_JgiR91ULtJcVO5QhL5gNcahGxU7oerUzCpWA5fXDMYM6SWO6GZpaySyIvRQTiXrtGHhar48Jj3djCQ3jaCNbdcpDZS2D7rYlPLal3uinkHVwmh6uMr6McRpMET1RrD9yxHaFozbFED2pnW06g_8ZJLzCTqeIFEhIJk2sBEor9XXI4xGE2UhdrwhnzBe5mE7zayg33b9Gj7ifb4jWmgF_orHpaFSsc-F9fJPesQjECa4RI75-qxGiSAoiZKi6sUJ0DZvy5rJ",["18"],"v1_ChdfTXVRYWM3YUlvUFk3TThQNS1QNXVBWRIXT00tUWFaRHlKZXpsN004UHlNLXlvQVU",["19"],["20","21"],["22","23"],["24","21"],[null,null,7,5],[null,null,8,5],[null,null,9,5],[null,null,10,5],[1,null,null,3],[null,null,null,"25"],[null,null,"26"],["27"],"user",["28","29"],"model",["30"],[],"Europe/Kiev",[null,"31"],[null,"32"],[null,"33",null,null,null,null,null,null,null,null,null,null,null,null,"34"],[null,"35"],"Hi!","Hello! How can I help you today?","","EqsDCqgDAb4+9vuPY6LFvH5DTrUKMBenSHwsAMDGvzIDDtfrRitGmhcz6PNXQj+K+OJrNycJFGwU2DYqKbm8ONKcp0cR+9nAp3q6DNFqiW09oKV1pT0vpcsERH4kPyUCUr+q9NuKBrQNODvJ5QXVZoMQnCRoXrw0pgQUN8RBqHEaYnhK0HqJowSBfbXg/XAZnmYRxKFk0S900VEBenHy7flAqPLfAWiqnRHOhYHt44hrV5m7mj+RHfOamYag4LVM4ybCmv0OHwGMjxiF5+LFzbxAMSWsT4iIs+rE0tE0u3hXhbrG+ajaIyD3GYcZGlqjDBcTy6rC8QMFX3kOW6/Eo+zU+6KvwN4O08NzuEFbi6SvHbzyeH61FjJ4916rxm13z3QdOoL7FMORrrvfWXWbPuhQ+vD+4hVTfit2cyoOtj7F8zb0nPM/ugG0sx0temlxt5CPhZdH3nDjQ00ERYUfkvXYw73IVb75MJZHtlOjqrseG0hBd2gXxPXhk9td6dDdUOWXNYh7gZiWvE0Uxk/rdir+R8mUnXUBh+vSTdcEDA+Oku15YJ32Qi1AkTlQSw==","!"]
        const c = _.Xv(b.request).reduce((y, B) => y + B.xg().reduce((G, N) => G + N.getText().length, 0), 0); // = 36
        if (a.oh && c > 83886080) BI(a, 'Request is too large. Please try smaller requests.');
         else {
          var d = b.index,
          e, // = [null,null,null,65536,1,0.95,64,null,null,null,null,null,null,1,null,null,[1,null,null,3]]
          f = ((e = _.Sm(b.request, _.Vm, 4)) == null ? void 0 : _.m(e, 8)) === 'application/json', // false
          g, // = [null,null,null,65536,1,0.95,64,null,null,null,null,null,null,1,null,null,[1,null,null,3]]
          h = (g = _.Sm(b.request, _.Vm, 4)) == null ? void 0 : cXa(g); // [1,null,null,3]
          a.R.jvb() &&
          _.Jj(b.request, 11, !0);
          a.R.kL();
          var k = !0; // = true
          a.F.error.set(void 0);
          var n = !!a.Aa.Ab(), // = false
          q = a.Vc.generateContent(b.request), // = [{"ha":false,"J":"1","aa":"2","ea":"3","R":"4","F":"5","fa":"6","xhr":"7"},[],[],[null],[],[null],{"R":"8","J":"9","F":"10"},{"Ba":false,"rA":"11","Gdb":"7","cea":null,"headers":"12","Sa":null,"R":true,"F":"13","ka":"14","J":0,"ea":"15","Ia":false,"oa":false,"Na":false,"fa":false,"Fa":0,"ha":null,"Aa":"15","aa":true},{"F":"7","J":null,"R":0,"ea":0,"na":false,"fa":null,"ka":"16"},{"data":"17","end":"18","error":"19"},{},{"src":"7","listeners":"20","F":1},{},{},"https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateContent","",{"Ba":false,"Pa":"8","fa":"21"},[null],[null],[null],{"readystatechange":"22"},{"42":"23"},["23"],{"proxy":null,"src":"7","type":"24","capture":false,"handler":"8","key":42,"M9":false,"removed":false},"readystatechange"]
          u = a.Ia.subscribe(
            () => {
              q.cancel();
              _.EI(a, {
                index: d
              });
              FI(a, {
                index: d,
                qt: 'cancel'
              })
            }
          ),
          w = []; // = []
          q.on(
            'data',
            y => {
              if (_.qn(y, _.Y9a, 6)) a.R.Kub(_.Sm(y, _.Y9a, 6)),
              _.EI(a, {
                index: d
              });
               else if (_.qn(y, _.X9a, 5)) a.R.Qrb(y);
               else if (_.qn(y, _.W9a, 7)) a.R.kL(_.Sm(y, _.W9a, 7));
               else {
                k &&
                (HGb(a, {
                  time: Date.now(),
                  index: d
                }), k = !1);
                var B = _.Sm(y, _.Vw, 4);
                B &&
                IGb(a, {
                  eventId: B,
                  index: d
                });
                var G,
                N = (G = _.Ww(y) [0]) == null ? void 0 : G.vc();
                G = _.Sm(y, _.Uw, 3);
                JGb(a, {
                  yF: _.m(y, 8),
                  index: d
                });
                if (N) {
                  B = (h == null ? 0 : _.en(h, 2)) ? _.vj(h, 2) : void 0;
                  const U = (h == null ? 0 : _.vn(h, 4) != null) ? _.Wm(h, 4) : void 0;
                  for (var O of N.xg()) {
                    var P = N = void 0,
                    R = void 0;
                    (
                      N = (R = _.nj(O)) == null ? void 0 : (P = _.tu(R)) == null ? void 0 : P.startsWith('audio/')
                    ) != null &&
                    N ||
                    KGb(a, w, d);
                    switch (_.mj(O)) {
                      case 0:
                        _.vp(O, 15) &&
                        LGb(
                          a,
                          {
                            text: '',
                            index: d,
                            thought: !0,
                            ow: {
                              thinkingBudget: B,
                              thinkingLevel: U
                            },
                            isJson: !1,
                            part: O
                          }
                        );
                        break;
                      case 2:
                        LGb(
                          a,
                          {
                            text: a.Ba ? '' : O.getText(),
                            index: d,
                            thought: _.Tu(O),
                            ow: _.Tu(O) ? {
                              thinkingBudget: B,
                              thinkingLevel: U
                            }
                             : void 0,
                            isJson: f &&
                            !_.Tu(O),
                            part: O
                          }
                        );
                        break;
                      case 8:
                        if (_.Ou(O)) {
                          var V = void 0,
                          W = void 0;
                          N = a;
                          P = {
                            index: d,
                            part: O
                          };
                          R = {
                            Jb: 'code_execution',
                            zm: !1,
                            id: _.Gm(),
                            role: 'model',
                            tokenCount: 0,
                            wb: 1,
                            parts: [
                              P.part
                            ],
                            codeExecutionData: P.code ? {
                              executable: {
                                code: (W = P.code) != null ? W : '',
                                language: (V = P.language) != null ? V : ''
                              }
                            }
                             : void 0
                          };
                          V = new Map(N.F.entities());
                          GI(N, V, P.index, R)
                        }
                        break;
                      case 9:
                        _.Qu(O) &&
                        (
                          V = void 0,
                          N = a,
                          P = {
                            index: d,
                            part: O
                          },
                          R = {
                            Jb: 'code_execution',
                            zm: !1,
                            id: _.Gm(),
                            role: 'model',
                            tokenCount: 0,
                            wb: 1,
                            parts: [
                              P.part
                            ],
                            codeExecutionData: P.outcome &&
                            P.output ? {
                              result: {
                                outcome: (V = P.outcome) != null ? V : 0,
                                output: P.outcome === 1 ? P.output : void 0,
                                error: P.outcome !== 1 ? P.output : void 0
                              }
                            }
                             : void 0
                          },
                          V = new Map(N.F.entities()),
                          GI(N, V, P.index, R)
                        );
                        break;
                      case 11:
                        _.Su(O) &&
                        (
                          R = void 0,
                          N = a,
                          P = {
                            index: d,
                            part: O
                          },
                          V = _.Gm(),
                          W = P.id ? {
                            functionCall: {
                              name: (R = P.name) != null ? R : '',
                              id: P.id,
                              args: P.args
                            },
                            response: ''
                          }
                           : {
                            response: ''
                          },
                          R = {
                            Jb: 'function_call',
                            zm: !1,
                            id: V,
                            role: 'model',
                            tokenCount: 0,
                            wb: 1,
                            lk: W,
                            parts: [
                              P.part
                            ]
                          },
                          V = new Map(N.F.entities()),
                          GI(N, V, P.index, R)
                        );
                        break;
                      case 3:
                        if ((N = _.nj(O)) && !N.getData().isEmpty()) {
                          P = _.tu(N);
                          R = _.oc(N.getData());
                          P = {
                            url: _.ko(P, R),
                            mimeType: P,
                            zc: R
                          };
                          let Z;
                          ((Z = _.tu(N)) == null ? 0 : Z.startsWith('audio/')) ?
                          w.push(P) : a.Fc ? MGb(a, {
                            index: d,
                            part: O,
                            cU: n
                          }) : MGb(a, {
                            le: P,
                            index: d,
                            part: O,
                            cU: n
                          })
                        }
                    }
                  }
                }
                G &&
                a.Ga.set(d, G);
                var ra;
                O = (ra = _.Sm(y, _.Z9a, 2)) == null ? void 0 : _.Wm(ra, 1);
                if (O != null) {
                  var fa;
                  let U;
                  ra = {
                    safetyRatings: lza(
                      [...(
                        (U = (fa = _.Sm(y, _.Z9a, 2)) == null ? void 0 : _.tj(fa, _.rw, 2, _.uj())) != null ? U : []
                      )]
                    ),
                    finishReason: zGb.get(O)
                  };
                  var za;
                  (fa = (za = _.Sm(y, _.Z9a, 2)) == null ? void 0 : _.m(za, 3)) &&
                  (ra = Object.assign({
                  }, ra, {
                    finishMessage: fa
                  }));
                  NGb(a, {
                    Oi: ra,
                    index: d
                  })
                } else if (fa = _.Ww(y) [0]) za = {
                  safetyRatings: lza([..._.tj(fa, _.rw, 5, _.uj())]),
                  finishReason: _.Wm(fa, 2)
                },
                (fa = _.m(fa, 4)) &&
                (za = Object.assign({
                }, za, {
                  finishMessage: fa
                })),
                NGb(a, {
                  Oi: za,
                  index: d
                });
                OGb(a, y, d);
                var J;
                y = (J = _.Ww(y) [0]) == null ? void 0 : _.Sm(J, _.qw, 8);
                (J = _.CAa(y)) &&
                J &&
                (y = a.F.fc() [d]) &&
                (J = _.tAa(y.vn, J), HI(a, d, {
                  vn: J
                }));
                FI(a, {
                  index: d,
                  qt: 'data'
                })
              }
            }
          );
          q.on(
            'status',
            y => {
              const B = y.code;
              B !== 0 &&
              (
                a.R.isOpen() ? a.R.kL() : (
                  y = new _.nn(B, y.details),
                  PGb(a, {
                    error: y,
                    index: d
                  }),
                  _.EI(a, {
                    index: d
                  }),
                  FI(a, {
                    index: d,
                    qt: 'status'
                  })
                )
              )
            }
          );
          q.on(
            'error',
            y => {
              a.R.isOpen() ? a.R.kL() : a.lb.Tc() &&
              (
                PGb(a, {
                  error: y,
                  index: d
                }),
                _.EI(a, {
                  index: d
                }),
                FI(a, {
                  index: d,
                  qt: 'error'
                })
              )
            }
          );
          q.on(
            'end',
            () => _.x(
              function * () {
                if (a.R.isOpen()) a.R.jlb();
                 else {
                  KGb(a, w, d);
                  u.unsubscribe();
                  if (d === 0 && !CGa(a.wc)) {
                    var y = a.lb.ea(0) ();
                    const B = GBa(y, 'user');
                    y = GBa(y, 'model');
                    let G,
                    N;
                    yield zwb(
                      a.wc,
                      (G = B == null ? void 0 : B.text) != null ? G : '',
                      (N = y == null ? void 0 : y.text) != null ? N : ''
                    )
                  }
                  _.EI(a, {
                    index: d
                  });
                  FI(a, {
                    index: d,
                    qt: 'end'
                  })
                }
              }
            )
          )
        }
      };
```