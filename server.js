
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const publicPath = path.join(__dirname, 'public');
const dataPath = path.join(__dirname, 'data', 'estudiantes.json');

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // GET: mostrar estudiantes
    if (req.url === '/api/estudiantes' && req.method === 'GET') {
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify({
                    mensaje: 'Error al leer los estudiantes'
                }));
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(data);
        });
        return;
    }

    // POST: guardar un estudiante
    if (req.url === '/api/estudiantes' && req.method === 'POST') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            let estudiante;

            try {
                estudiante = JSON.parse(body);
            } catch (error) {
                res.writeHead(400, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify({
                    mensaje: 'JSON no válido'
                }));
                return;
            }

            fs.readFile(dataPath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify({
                        mensaje: 'Error al leer los datos'
                    }));
                    return;
                }

                let estudiantes;

                try {
                    estudiantes = JSON.parse(data);
                } catch (error) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json; charset=utf-8'
                    });
                    res.end(JSON.stringify({
                        mensaje: 'Error en el archivo JSON'
                    }));
                    return;
                }

                estudiantes.push(estudiante);

                fs.writeFile(
                    dataPath,
                    JSON.stringify(estudiantes, null, 2),
                    (err) => {
                        if (err) {
                            res.writeHead(500, {
                                'Content-Type': 'application/json; charset=utf-8'
                            });
                            res.end(JSON.stringify({
                                mensaje: 'Error al guardar'
                            }));
                            return;
                        }

                        res.writeHead(201, {
                            'Content-Type': 'application/json; charset=utf-8'
                        });
                        res.end(JSON.stringify(estudiante));
                    }
                );
            });
        });
        return;
    }

    // Servir archivos HTML y CSS
    if (req.method === 'GET') {
        const ruta = req.url === '/'
            ? '/index.html'
            : decodeURIComponent(req.url.split('?')[0]);

        const archivo = path.resolve(publicPath, '.' + ruta);

        if (!archivo.startsWith(publicPath + path.sep)) {
            res.writeHead(404, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify({
                mensaje: 'Recurso no encontrado'
            }));
            return;
        }

        const extension = path.extname(archivo);

        const tipos = {
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.js': 'text/javascript; charset=utf-8'
        };

        fs.readFile(archivo, (err, contenido) => {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify({
                    mensaje: 'Recurso no encontrado'
                }));
                return;
            }

            res.writeHead(200, {
                'Content-Type': tipos[extension] || 'text/plain; charset=utf-8'
            });
            res.end(contenido);
        });
        return;
    }

    // Ruta no encontrada
    res.writeHead(404, {
        'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify({
        mensaje: 'Recurso no encontrado'
    }));
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
