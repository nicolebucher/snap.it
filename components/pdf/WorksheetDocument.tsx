import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatProfileMeta, type Profile, type WorksheetData } from "@/types/generation";
import { t, type Locale } from "@/lib/i18n/translations";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  brand: { marginBottom: 10, fontSize: 13, fontFamily: "Helvetica-BoldOblique", color: "#0d9488" },
  header: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 10, color: "#666666" },
  intro: { marginBottom: 16, fontSize: 11, lineHeight: 1.4 },
  task: { marginBottom: 20 },
  taskHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  taskNumber: { fontWeight: 700 },
  points: { color: "#888888", fontSize: 9 },
  option: { marginLeft: 12, marginTop: 3 },
  answerLine: { borderBottom: "1pt solid #cccccc", marginTop: 14, height: 28 },
});

export function WorksheetDocument({
  data,
  profile,
  locale,
}: {
  data: WorksheetData;
  profile: Profile;
  locale: Locale;
}) {
  const labels = t(locale).pdf;
  const meta = formatProfileMeta(profile, locale);
  // Erzwingt mindestens 3 Seiten: die Aufgaben werden in drei Drittel geteilt,
  // jedes Drittel beginnt garantiert auf einer neuen Seite (unabhängig von der Textlänge).
  const groupSize = Math.max(1, Math.ceil(data.tasks.length / 3));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>snap.it</Text>
        <View style={styles.header}>
          <Text style={styles.title}>{data.title}</Text>
          {meta && <Text style={styles.meta}>{meta}</Text>}
        </View>
        <Text style={styles.intro}>{data.introduction}</Text>
        {data.tasks.map((task, index) => (
          <View
            key={task.number}
            style={styles.task}
            wrap={false}
            break={index > 0 && index % groupSize === 0}
          >
            <View style={styles.taskHeader}>
              <Text style={styles.taskNumber}>
                {labels.task} {task.number}
              </Text>
              <Text style={styles.points}>
                {task.points} {labels.points}
              </Text>
            </View>
            <Text>{task.question}</Text>
            {task.type === "multiple-choice" &&
              task.options?.map((option, i) => (
                <Text key={i} style={styles.option}>
                  {String.fromCharCode(65 + i)}) {option}
                </Text>
              ))}
            {task.type !== "multiple-choice" && <View style={styles.answerLine} />}
          </View>
        ))}
      </Page>
    </Document>
  );
}
