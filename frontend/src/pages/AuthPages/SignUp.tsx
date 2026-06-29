import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Inscription - SMART NDC"
        description="SMART NDC - Inscription"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
