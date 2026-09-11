import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatProfileMeta, type Profile, type WorksheetData } from "@/types/generation";
import { t, type Locale } from "@/lib/i18n/translations";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  brand: { marginBottom: 10, fontSize: 13, fontFamily: "Helvetica-BoldOblique", color: "#0d9488" },
  header: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 10, color: "#666666" },
  nameLine: { marginTop: 12, fontSize: 10, borderBottom: "1pt solid #cccccc", paddingBottom: 16 },
  intro: { marginTop: 16, marginBottom: 16, fontSize: 11, lineHeight: 1.4 },
  task: { marginBottom: 16 },
  taskHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  taskNumber: { fontWeight: 700 },
  points: { color: "#888888", fontSize: 9 },
  option: { marginLeft: 12, marginTop: 2 },
  answerLine: { borderBottom: "1pt solid #cccccc", marginTop: 12, height: 20 },
  solutionsTitle: { fontSize: 16, fontWeight: 700, marginBottom: 12 },
  solutionRow: { marginBottom: 8 },
});

export function TestDocument({
  data,
  profile,
  locale,
}: {
  data: WorksheetData;
  profile: Profile;
  locale: Locale;
}) {
  const labels = t(locale).pdf;
  const totalPoints = data.tasks.reduce((sum, task) => sum + task.points, 0);
  const meta = formatProfileMeta(profile, locale);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>snap.it</Text>
        <View style={styles.header}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.meta}>{[meta, `${totalPoints} ${labels.totalPoints}`].filter(Boolean).join(" · ")}</Text>
        </View>
        <Text style={styles.nameLine}>
          {labels.name}: ______________________________  {labels.date}: ______________
        </Text>
        <Text style={styles.intro}>{data.introduction}</Text>
        {data.tasks.map((task) => (
          <View key={task.number} style={styles.task} wrap={false}>
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
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>snap.it</Text>
        <Text style={styles.solutionsTitle}>
          {labels.solutions} — {data.title}
        </Text>
        {data.tasks.map((task) => (
          <View key={task.number} style={styles.solutionRow}>
            <Text>
              <Text style={{ fontWeight: 700 }}>
                {labels.task} {task.number}:{" "}
              </Text>
              {task.answer}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
