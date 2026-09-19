# 과목별 오늘 할 일 웹앱

## 필요한 것
- Supabase 계정
- Vercel 계정
- GitHub 계정(가장 쉬운 배포 방법)

## 설정 순서
1. Supabase에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase.sql` 전체를 실행합니다.
3. Project Settings → API에서 Project URL과 Publishable/anon key를 확인합니다.
4. `app.js`의 `SUPABASE_URL`, `SUPABASE_ANON_KEY`를 자신의 값으로 바꿉니다.
5. 이 폴더를 GitHub 저장소에 올립니다.
6. Vercel에서 해당 GitHub 저장소를 Import하고 Deploy합니다.
7. 배포된 주소를 PC와 휴대폰에서 열고 같은 계정으로 로그인합니다.

주의: 프론트엔드에 넣는 Supabase anon/publishable key는 공개되어도 되지만, 절대로 service_role/secret key를 넣지 마세요.
