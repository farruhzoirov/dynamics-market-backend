FROM ubuntu:latest
LABEL authors="farruh"

ENTRYPOINT ["top", "-b"]