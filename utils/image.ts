import crypto from "crypto";
import fs from "fs";

export function getImageNameIfHave(
  year: number,
  month: number,
  date: number,
  user_id: string
) {
  const fn = createImageName(year, month, date, user_id);
  const fp = `${year}/${month}/${date}/${fn}`;
  return fs.existsSync(`upload/${fp}`) ? `/image/${fp}` : false;
}

export function createImageName(
  year: number,
  month: number,
  date: number,
  user_id: string
) {
  // 파일 이름 해시화로 보안 강화하고
  // 파일 이름 언제나 고유하게 생성 가능
  return (
    crypto
      .createHash("sha256")
      .update(`${year}${month}${date}${user_id}`)
      .digest("base64url") + ".jpg"
  );
}
