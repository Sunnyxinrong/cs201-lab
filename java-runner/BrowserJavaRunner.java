package cs201.runner;

import javax.tools.DiagnosticCollector;
import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.StringWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public final class BrowserJavaRunner {
    private static final int CAPTURE_LIMIT = 256 * 1024;
    private static Map<String, Bytecode> compiled = Map.of();

    private BrowserJavaRunner() {}

    public static String compile(String className, String source) throws IOException {
        compiled = Map.of();
        if (!className.matches("[A-Za-z_$][A-Za-z0-9_$]{0,63}")) {
            return "INVALID_CLASS\n";
        }
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) return "NO_COMPILER\n";

        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        Map<String, Bytecode> outputs = new HashMap<>();
        StringWriter messages = new StringWriter();
        boolean success;
        try (StandardJavaFileManager standard =
                     compiler.getStandardFileManager(diagnostics, Locale.ROOT, StandardCharsets.UTF_8)) {
            var inMemory = new ForwardingJavaFileManager<StandardJavaFileManager>(standard) {
                @Override
                public JavaFileObject getJavaFileForOutput(Location location, String name,
                                                           JavaFileObject.Kind kind, FileObject sibling) {
                    Bytecode output = new Bytecode(name, kind);
                    outputs.put(name, output);
                    return output;
                }
            };
            success = Boolean.TRUE.equals(compiler.getTask(messages, inMemory, diagnostics,
                    List.of("-proc:none", "-Xlint:unchecked"), null,
                    List.of(new SourceFile(className, source))).call());
        }
        for (var diagnostic : diagnostics.getDiagnostics()) {
            messages.append(diagnostic.getKind().name());
            if (diagnostic.getLineNumber() >= 1) {
                messages.append(" ").append(Long.toString(diagnostic.getLineNumber()))
                        .append(":").append(Long.toString(diagnostic.getColumnNumber()));
            }
            messages.append(" ").append(diagnostic.getMessage(Locale.ROOT)).append("\n");
        }
        if (success) compiled = Map.copyOf(outputs);
        return (success ? "OK" : "COMPILE_ERROR") + "\n" + encode(messages.toString());
    }

    public static String run(String className, String base64Input) {
        LimitedOutput stdout = new LimitedOutput();
        LimitedOutput stderr = new LimitedOutput();
        InputStream originalIn = System.in;
        PrintStream originalOut = System.out;
        PrintStream originalErr = System.err;
        String status = "OK";
        try (var out = new PrintStream(stdout, true, StandardCharsets.UTF_8);
             var err = new PrintStream(stderr, true, StandardCharsets.UTF_8)) {
            System.setIn(new ByteArrayInputStream(Base64.getDecoder().decode(base64Input)));
            System.setOut(out);
            System.setErr(err);
            try {
                Class<?> entry = new StudentLoader(compiled).loadClass(className);
                Method main = entry.getDeclaredMethod("main", String[].class);
                int modifiers = main.getModifiers();
                if (!Modifier.isPublic(modifiers) || !Modifier.isStatic(modifiers)
                        || main.getReturnType() != void.class) {
                    throw new NoSuchMethodException("Expected public static void main(String[] args)");
                }
                main.setAccessible(true);
                main.invoke(null, (Object) new String[0]);
            } catch (InvocationTargetException thrown) {
                status = "RUNTIME_ERROR";
                thrown.getCause().printStackTrace(err);
            } catch (ReflectiveOperationException | RuntimeException | LinkageError thrown) {
                status = "RUNTIME_ERROR";
                thrown.printStackTrace(err);
            }
        } finally {
            System.setIn(originalIn);
            System.setOut(originalOut);
            System.setErr(originalErr);
        }
        if (stdout.truncated || stderr.truncated) status = "OUTPUT_LIMIT";
        Base64.Encoder encoder = Base64.getEncoder();
        return status + "\n" + encoder.encodeToString(stdout.bytes.toByteArray())
                + "\n" + encoder.encodeToString(stderr.bytes.toByteArray());
    }

    private static String encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private static final class SourceFile extends SimpleJavaFileObject {
        private final String text;

        SourceFile(String name, String text) {
            super(URI.create("string:///" + name + Kind.SOURCE.extension), Kind.SOURCE);
            this.text = text;
        }

        @Override
        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
            return text;
        }
    }

    private static final class Bytecode extends SimpleJavaFileObject {
        private final ByteArrayOutputStream bytes = new ByteArrayOutputStream();

        Bytecode(String name, Kind kind) {
            super(URI.create("memory:///" + name.replace('.', '/') + kind.extension), kind);
        }

        @Override
        public OutputStream openOutputStream() {
            return bytes;
        }
    }

    private static final class StudentLoader extends ClassLoader {
        private final Map<String, Bytecode> classes;

        StudentLoader(Map<String, Bytecode> classes) {
            super(ClassLoader.getPlatformClassLoader());
            this.classes = classes;
        }

        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            Bytecode output = classes.get(name);
            if (output == null) throw new ClassNotFoundException(name);
            byte[] bytes = output.bytes.toByteArray();
            return defineClass(name, bytes, 0, bytes.length);
        }
    }

    private static final class LimitedOutput extends OutputStream {
        private final ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        private boolean truncated;

        @Override
        public void write(int value) {
            if (bytes.size() < CAPTURE_LIMIT) bytes.write(value);
            else truncated = true;
        }

        @Override
        public void write(byte[] data, int offset, int length) {
            int count = Math.min(length, CAPTURE_LIMIT - bytes.size());
            bytes.write(data, offset, count);
            if (count < length) truncated = true;
        }
    }
}
