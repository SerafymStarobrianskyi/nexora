import Layout from "../../components/layout/Layout";
import { useAuthStore } from "../../store/authStore";
import "./settings-page.css";

export default function SettingsPage(){
  const {user, logout} = useAuthStore();
  return (
    <Layout>
      <section className="settings-page">
        <h1 className="settings-page__title">Settings</h1>
        <p>{user?.email}</p>
        <button type="button" onClick={()=>logout()}>
          Logout
        </button>
      </section>
    </Layout>
  )
}
