import { redirect } from "next/navigation";

export default function Home() {
  redirect("/forecast");
  return null;
}
