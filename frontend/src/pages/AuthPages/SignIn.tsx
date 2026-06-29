import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Connexion - SMART NDC"
        description="Application intégrée de gestion RH et Inventaire - SMART NDC"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
