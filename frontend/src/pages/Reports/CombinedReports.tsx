import { useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useAppStore } from "../../store/appStore";

export default function CombinedReports() {
  const employees = useAppStore((s) => s.employees);
  const stockMovements = useAppStore((s) => s.stockMovements);
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);
  const products = useAppStore((s) => s.products);

  const sellerRanking = useMemo(() => {
    const salesByEmployee: Record<
      string,
      { name: string; count: number; department: string }
    > = {};

    stockMovements
      .filter((m) => m.reason === "sale")
      .forEach((m) => {
        if (!salesByEmployee[m.employeeId]) {
          const emp = employees.find((e) => e.id === m.employeeId);
          salesByEmployee[m.employeeId] = {
            name: m.employeeName,
            count: 0,
            department: emp?.departmentName || "",
          };
        }
        salesByEmployee[m.employeeId].count += m.quantity;
      });

    return Object.values(salesByEmployee).sort((a, b) => b.count - a.count);
  }, [stockMovements, employees]);

  const traceability = useMemo(() => {
    return stockMovements
      .map((m) => {
        const att = attendanceRecords.find(
          (a) => a.employeeId === m.employeeId && a.date === m.timestamp.split("T")[0]
        );
        const isPresent = att && (att.status === "present" || att.status === "late");
        return {
          ...m,
          attendanceStatus: isPresent ? "present" : ("absent" as const),
          attendanceDate: att?.date || null,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [stockMovements, attendanceRecords]);

  const anomalies = useMemo(() => {
    return traceability.filter(
      (m) => m.attendanceStatus === "absent"
    );
  }, [traceability]);

  const damagedByEmployee = useMemo(() => {
    const grouped: Record<
      string,
      { name: string; items: { productName: string; quantity: number; price: number }[]; totalValue: number }
    > = {};

    stockMovements
      .filter((m) => m.reason === "damaged")
      .forEach((m) => {
        if (!grouped[m.employeeId]) {
          grouped[m.employeeId] = { name: m.employeeName, items: [], totalValue: 0 };
        }
        const product = products.find((p) => p.id === m.productId);
        const value = product ? product.price * m.quantity : 0;
        grouped[m.employeeId].items.push({
          productName: m.productName,
          quantity: m.quantity,
          price: product?.price || 0,
        });
        grouped[m.employeeId].totalValue += value;
      });

    return Object.values(grouped);
  }, [stockMovements, products]);

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <PageMeta
        title="Rapports Combinés - SMART NDC"
        description="Rapports croisés RH et Stock"
      />

      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-800 dark:text-white/90">
          Rapports Combinés
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Analyse croisée RH et Stock
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
            Classement Vendeurs
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Rang
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Employé
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Nb Sorties
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Département
                  </th>
                </tr>
              </thead>
              <tbody>
                {sellerRanking.map((s, i) => (
                  <tr
                    key={s.name}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-white/90">
                      #{i + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.count}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.department}
                    </td>
                  </tr>
                ))}
                {sellerRanking.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-sm text-gray-400"
                    >
                      Aucune vente enregistrée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
            Traçabilité : Qui a pris quoi et quand
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Employé
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Statut Présence
                  </th>
                </tr>
              </thead>
              <tbody>
                {traceability.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                      {m.employeeName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {m.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(m.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-theme-xs font-medium ${
                          m.type === "in"
                            ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                            : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
                        }`}
                      >
                        {m.type === "in" ? "Entrée" : "Sortie"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.attendanceStatus === "present" ? (
                        <span className="inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                          Présent
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-error-50 px-2 py-0.5 text-theme-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
            Anomalies
          </h3>
          {anomalies.length === 0 ? (
            <p className="text-sm text-success-600">
              Aucune anomalie détectée — tous les mouvements ont été effectués par des employés présents.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Employé
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Alerte
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                        {m.employeeName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {m.productName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDateTime(m.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-theme-xs font-medium ${
                            m.type === "in"
                              ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                              : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
                          }`}
                        >
                          {m.type === "in" ? "Entrée" : "Sortie"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-error-50 px-2 py-0.5 text-theme-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
                          Absent ce jour
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
            Valorisation Produits Dégradés par Employé
          </h3>
          {damagedByEmployee.length === 0 ? (
            <p className="text-sm text-gray-400">
              Aucun produit dégradé enregistré
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Employé
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Qté
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Valeur Unitaire
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Valeur Totale
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {damagedByEmployee.map((emp) => (
                    <>
                      {emp.items.map((item, idx) => (
                        <tr
                          key={`${emp.name}-${idx}`}
                          className="border-b border-gray-100 dark:border-gray-800"
                        >
                          {idx === 0 && (
                            <td
                              rowSpan={emp.items.length}
                              className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90"
                            >
                              {emp.name}
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.productName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.price.toLocaleString("fr-FR")} DH
                          </td>
                          {idx === 0 && (
                            <td
                              rowSpan={emp.items.length}
                              className="px-4 py-3 text-sm font-bold text-error-600"
                            >
                              {emp.totalValue.toLocaleString("fr-FR")} DH
                            </td>
                          )}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
