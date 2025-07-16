import { redirect } from "next/navigation";
// import Cookies from "js-cookie";
import { cookies } from "next/headers";
export default async function Home() {
  // const cookieStore = cookies();
  // const token = (await cookieStore).get("token")?.value;
  // console.log(token);
  // if (token) {
  redirect("/dashboard");
  // } else {
  //   redirect("/auth");
  // }
}
