# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Download Go dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build statically linked binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o findmate-server main.go

# Production Runtime Stage
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy binary and migrations directory
COPY --from=builder /app/findmate-server .
COPY --from=builder /app/migrations ./migrations

# Expose default HTTP port
EXPOSE 8080

CMD ["./findmate-server"]
